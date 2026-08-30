import { callTextJson } from "../common/openai.client";
import { AnswerRegion, Question, QuestionMapping } from "../common/types";

/**
 * Normalizes a printed/handwritten question label down to a comparable key, e.g.
 * "Q11 (a)", "11(a)", "11 a)" all become "11a".
 */
function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/^q\.?\s*/i, "")
    .replace(/[().\s]/g, "")
    .trim();
}

export async function mapAnswersToQuestions(
  questions: Question[],
  answers: AnswerRegion[]
): Promise<{ mapping: QuestionMapping[]; unmatchedAnswerIds: string[] }> {
  const mapping: QuestionMapping[] = [];
  const usedAnswerIds = new Set<string>();

  // Pass 1: direct label match, order-independent.
  const answersByNormalizedLabel = new Map<string, AnswerRegion>();
  for (const a of answers) {
    if (a.label) {
      answersByNormalizedLabel.set(normalizeLabel(a.label), a);
    }
  }

  const unresolvedQuestions: Question[] = [];

  for (const q of questions) {
    const key = normalizeLabel(q.number);
    const match = answersByNormalizedLabel.get(key);
    if (match) {
      mapping.push({
        questionId: q.id,
        status: "answered",
        answerRegionId: match.id,
        matchType: "label",
        confidence: 0.95,
      });
      usedAnswerIds.add(match.id);
    } else {
      unresolvedQuestions.push(q);
    }
  }

  // Pass 2: semantic fallback for questions with no label match, using only unlabeled/unused answers.
  const candidateAnswers = answers.filter((a) => !usedAnswerIds.has(a.id));

  if (unresolvedQuestions.length > 0 && candidateAnswers.length > 0) {
    const semanticMatches = await semanticMatch(unresolvedQuestions, candidateAnswers);

    for (const q of unresolvedQuestions) {
      const result = semanticMatches[q.id];
      if (result && result.answerId && !usedAnswerIds.has(result.answerId) && result.confidence >= 0.5) {
        mapping.push({
          questionId: q.id,
          status: "answered",
          answerRegionId: result.answerId,
          matchType: "semantic",
          confidence: result.confidence,
        });
        usedAnswerIds.add(result.answerId);
      } else {
        mapping.push({
          questionId: q.id,
          status: "unanswered",
          answerRegionId: null,
          matchType: null,
          confidence: 0,
        });
      }
    }
  } else {
    for (const q of unresolvedQuestions) {
      mapping.push({
        questionId: q.id,
        status: "unanswered",
        answerRegionId: null,
        matchType: null,
        confidence: 0,
      });
    }
  }

  const unmatchedAnswerIds = answers.filter((a) => !usedAnswerIds.has(a.id)).map((a) => a.id);

  // Preserve original question order in the returned mapping.
  const orderById = new Map(questions.map((q, idx) => [q.id, idx]));
  mapping.sort((a, b) => (orderById.get(a.questionId) ?? 0) - (orderById.get(b.questionId) ?? 0));

  return { mapping, unmatchedAnswerIds };
}

const SYSTEM_PROMPT = `You match unlabeled student answers to the exam questions they most likely answer, based
on content similarity. You will be given a JSON list of "questions" (id, number, text) that have no explicit
label match, and a JSON list of "answers" (id, text) that are unmatched/unlabeled. For each question, decide
which answer (if any) best matches its content, or none.

Return STRICT JSON only:
{
  "matches": [ { "questionId": "q-1", "answerId": "a-3", "confidence": 0.8 } ]
}
Only include a question in "matches" if you found a plausible match; omit questions with no reasonable
answer. confidence is 0-1, where 1.0 is certain.`;

async function semanticMatch(
  questions: Question[],
  answers: AnswerRegion[]
): Promise<Record<string, { answerId: string; confidence: number }>> {
  const userPrompt = JSON.stringify({
    questions: questions.map((q) => ({ id: q.id, number: q.number, text: q.text })),
    answers: answers.map((a) => ({ id: a.id, text: a.text })),
  });

  const result = await callTextJson({ systemPrompt: SYSTEM_PROMPT, userPrompt });
  const matches: any[] = Array.isArray(result?.matches) ? result.matches : [];

  const out: Record<string, { answerId: string; confidence: number }> = {};
  for (const m of matches) {
    if (m?.questionId && m?.answerId) {
      out[m.questionId] = { answerId: m.answerId, confidence: Number(m.confidence ?? 0.5) };
    }
  }
  return out;
}
