import { callVisionJson, sleep } from "../common/openai.client";
import { PageImage, Question } from "../common/types";

// Paces sequential per-page calls to stay under low-tier per-minute request caps common on
// free/trial OpenAI accounts (e.g. 10 RPM). withRetry() in openai.client still handles any overflow.
const PAGE_CALL_DELAY_MS = 4500;

const SYSTEM_PROMPT = `You are an expert exam-paper parser. You will be shown ONE page image of a printed
question paper. Extract EVERY question that appears on THIS page, top to bottom.

Rules:
- If a question has labelled sub-parts (e.g. "a)", "b)", "(i)", "(ii)"), treat EACH sub-part as its own
  separate question entry. Its "number" should combine the parent and sub-part label, e.g. "11(a)", "11(b)".
  Set "parentNumber" to the parent question's number (e.g. "11") in that case; omit/null it for top-level
  questions with no sub-parts.
- Preserve the ORIGINAL numbering exactly as printed (including things like "Q1", "1.", "2)", etc.) in "number".
- "text" should be the full question text (strip the leading number/label itself from "text").
- If a question offers two alternative versions joined by the word "OR" (a common board-exam pattern, where
  the student answers either alternative), keep it as ONE entry with both alternatives in "text" separated by
  " OR " -- do not split it into two entries with the same number.
- Ignore headers, instructions, marks allocation notes, and footers -- only extract actual questions.
- If this page has no questions on it (e.g. a cover page), return an empty "questions" array.

Return STRICT JSON only, matching this shape:
{
  "questions": [
    { "number": "11(a)", "parentNumber": "11", "text": "..." }
  ]
}`;

export async function extractQuestions(pages: PageImage[]): Promise<Question[]> {
  const sorted = [...pages].sort((a, b) => a.page - b.page);
  const questions: Question[] = [];
  const overallStart = Date.now();

  for (const [idx, page] of sorted.entries()) {
    if (idx > 0) await sleep(PAGE_CALL_DELAY_MS);
    const pageStart = Date.now();
    console.log(`[questions] page ${page.page} (${idx + 1}/${sorted.length}) starting`);
    const userPrompt = `This is page ${page.page} of the question paper. Extract all questions on it per
the rules in the system prompt.`;

    const result = await callVisionJson({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      images: [{ dataUrl: page.dataUrl, page: page.page }],
    });

    const rawQuestions: any[] = Array.isArray(result?.questions) ? result.questions : [];
    console.log(
      `[questions] page ${page.page} done in ${Date.now() - pageStart}ms, found ${rawQuestions.length} question(s)`
    );

    for (const q of rawQuestions) {
      questions.push({
        id: uniqueId(`q-${slugify(q.number ?? String(questions.length))}`, questions),
        number: String(q.number ?? `${questions.length + 1}`),
        parentNumber: q.parentNumber ? String(q.parentNumber) : undefined,
        text: String(q.text ?? "").trim(),
        order: questions.length,
      });
    }
  }

  console.log(
    `[questions] all pages done in ${Date.now() - overallStart}ms, ${questions.length} question(s) total`
  );
  return questions;
}

function uniqueId(base: string, existing: Question[]): string {
  if (!existing.some((q) => q.id === base)) return base;
  let i = 2;
  while (existing.some((q) => q.id === `${base}-${i}`)) i++;
  return `${base}-${i}`;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
