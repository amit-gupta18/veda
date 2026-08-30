import { callTextJson } from "../common/openai.client";
import { AnswerRegion, GradingResult, Question, QuestionMapping } from "../common/types";

const SYSTEM_PROMPT = `You are a fair exam grader. You will receive a JSON list of question/answer pairs
(some answers may be missing = unanswered). For each item, grade the answer against the question:
- "isCorrect": true/false/null. Use null ONLY for unanswered questions.
- "marks": your awarded marks out of "maxMarks" (use 10 as maxMarks for every question unless stated
  otherwise), as an integer. Use null for unanswered questions.
- "feedback": one or two short, constructive sentences explaining the grade. For unanswered questions, say
  the question was not answered.

Also produce an overall "summary": 2-4 sentences summarizing the student's overall performance, key
strengths and weaknesses.

Return STRICT JSON only:
{
  "results": [ { "questionId": "q-1", "isCorrect": true, "marks": 8, "maxMarks": 10, "feedback": "..." } ],
  "summary": "..."
}`;

export async function gradeAnswers(
  questions: Question[],
  answers: AnswerRegion[],
  mapping: QuestionMapping[]
): Promise<{ grading: GradingResult[]; summary: string }> {
  const answerById = new Map(answers.map((a) => [a.id, a]));
  const mappingByQuestionId = new Map(mapping.map((m) => [m.questionId, m]));

  const items = questions.map((q) => {
    const m = mappingByQuestionId.get(q.id);
    const answer = m?.answerRegionId ? answerById.get(m.answerRegionId) : undefined;
    return {
      questionId: q.id,
      number: q.number,
      questionText: q.text,
      answered: Boolean(answer),
      answerText: answer?.text ?? null,
    };
  });

  const userPrompt = JSON.stringify({ items, maxMarksPerQuestion: 10 });

  const result = await callTextJson({ systemPrompt: SYSTEM_PROMPT, userPrompt, maxTokens: 4096 });

  const rawResults: any[] = Array.isArray(result?.results) ? result.results : [];
  const gradingByQuestionId = new Map(rawResults.map((r) => [r.questionId, r]));

  const grading: GradingResult[] = questions.map((q) => {
    const r = gradingByQuestionId.get(q.id);
    const m = mappingByQuestionId.get(q.id);
    if (!r || m?.status === "unanswered") {
      return {
        questionId: q.id,
        isCorrect: null,
        marks: null,
        maxMarks: 10,
        feedback: "Not answered.",
      };
    }
    return {
      questionId: q.id,
      isCorrect: typeof r.isCorrect === "boolean" ? r.isCorrect : null,
      marks: typeof r.marks === "number" ? r.marks : null,
      maxMarks: typeof r.maxMarks === "number" ? r.maxMarks : 10,
      feedback: String(r.feedback ?? ""),
    };
  });

  const summary = String(result?.summary ?? "");

  return { grading, summary };
}
