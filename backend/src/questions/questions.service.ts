import { callVisionJson } from "../common/openai.client";
import { PageImage, Question } from "../common/types";

const SYSTEM_PROMPT = `You are an expert exam-paper parser. You will be shown one or more page images of a printed
question paper, in page order. Extract EVERY question in the exact printed order.

Rules:
- If a question has labelled sub-parts (e.g. "a)", "b)", "(i)", "(ii)"), treat EACH sub-part as its own
  separate question entry. Its "number" should combine the parent and sub-part label, e.g. "11(a)", "11(b)".
  Set "parentNumber" to the parent question's number (e.g. "11") in that case; omit/null it for top-level
  questions with no sub-parts.
- Preserve the ORIGINAL numbering exactly as printed (including things like "Q1", "1.", "2)", etc.) in "number".
- "text" should be the full question text (strip the leading number/label itself from "text").
- "order" is a 0-based index reflecting the printed order across the whole paper (top-level and sub-parts
  interleaved in reading order).
- Ignore headers, instructions, marks allocation notes, and footers -- only extract actual questions.
- Return STRICT JSON only, matching this shape:
{
  "questions": [
    { "number": "11(a)", "parentNumber": "11", "text": "...", "order": 0 }
  ]
}`;

export async function extractQuestions(pages: PageImage[]): Promise<Question[]> {
  const userPrompt = `Here are ${pages.length} page image(s) of a question paper, in order. Extract all questions
per the rules in the system prompt.`;

  const result = await callVisionJson({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    images: pages.map((p) => ({ dataUrl: p.dataUrl, page: p.page })),
  });

  const rawQuestions: any[] = Array.isArray(result?.questions) ? result.questions : [];

  return rawQuestions.map((q, idx) => ({
    id: `q-${slugify(q.number ?? String(idx))}`,
    number: String(q.number ?? `${idx + 1}`),
    parentNumber: q.parentNumber ? String(q.parentNumber) : undefined,
    text: String(q.text ?? "").trim(),
    order: typeof q.order === "number" ? q.order : idx,
  }));
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
