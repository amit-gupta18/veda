import { callVisionJson, sleep } from "../common/openai.client";
import { AnswerRegion, BBox, PageImage } from "../common/types";

const PAGE_CALL_DELAY_MS = 4500;

const SYSTEM_PROMPT = `You are an expert at reading handwritten exam answer sheets. You will be shown ONE page
image of a student's answer sheet.

For EACH distinct answer that starts or continues on THIS page, produce one entry with:
- "label": the question number/label the student explicitly wrote next to the answer (e.g. "11(a)", "Q3",
  "2 b)"), normalized to look like "11(a)" style where possible. If the student wrote NO discernible label
  for this block (e.g. it's a continuation of an answer from the previous page, or genuinely unlabeled),
  set this to null.
- "text": your best transcription of the handwritten answer content on this page (doesn't need to be
  perfect, just representative).
- "continuesFromPrevious": true if this block is clearly a continuation of an answer that started on an
  earlier page (e.g. it starts mid-sentence, has no label, and picks up where a previous page's writing would
  have left off). Otherwise false.
- "region": ONE bounding box tightly enclosing this block's handwritten content on this page (including any
  diagrams drawn as part of the answer), as normalized 0-1 values:
  { "x": <left>, "y": <top>, "w": <width>, "h": <height> }.

Rules:
- Treat clearly separate answers (different handwriting blocks, often separated by a written label or by
  blank space) as separate entries, even if unlabeled.
- Do not merge multiple distinct answers into one entry.
- Do not skip content that doesn't look labelled -- still capture it as an entry with label: null.
- If this page has no handwritten answer content, return an empty "answers" array.

Return STRICT JSON only, matching this shape:
{
  "answers": [
    { "label": "11(a)", "text": "...", "continuesFromPrevious": false,
      "region": { "x": 0.1, "y": 0.2, "w": 0.8, "h": 0.15 } }
  ]
}`;

interface RawPageAnswer {
  label: string | null;
  text: string;
  continuesFromPrevious: boolean;
  region: BBox;
}

export async function extractAnswers(pages: PageImage[]): Promise<AnswerRegion[]> {
  const sorted = [...pages].sort((a, b) => a.page - b.page);
  const answers: AnswerRegion[] = [];
  let lastAnswerOnPreviousPage: AnswerRegion | null = null;

  for (const [idx, page] of sorted.entries()) {
    if (idx > 0) await sleep(PAGE_CALL_DELAY_MS);
    const userPrompt = `This is page ${page.page} of the student's answer sheet. Extract all answer blocks on
it per the rules in the system prompt.`;

    const result = await callVisionJson({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      images: [{ dataUrl: page.dataUrl, page: page.page }],
    });

    const rawAnswers: any[] = Array.isArray(result?.answers) ? result.answers : [];
    let firstOnThisPage = true;

    for (const raw of rawAnswers) {
      const parsed = normalizeRawAnswer(raw, page.page);

      // Stitch a continuation onto the last answer from the previous page rather than
      // creating a new entry, so multi-page answers stay as one AnswerRegion with multiple regions.
      if (firstOnThisPage && parsed.continuesFromPrevious && lastAnswerOnPreviousPage) {
        lastAnswerOnPreviousPage.text += `\n${parsed.text}`;
        lastAnswerOnPreviousPage.regions.push(parsed.region);
      } else {
        answers.push({
          id: `a-${answers.length + 1}`,
          label: parsed.label,
          text: parsed.text,
          regions: [parsed.region],
        });
      }
      firstOnThisPage = false;
    }

    lastAnswerOnPreviousPage = answers[answers.length - 1] ?? null;
  }

  return answers;
}

function normalizeRawAnswer(raw: any, page: number): RawPageAnswer {
  const region = raw?.region ?? {};
  return {
    label: raw?.label ? String(raw.label) : null,
    text: String(raw?.text ?? "").trim(),
    continuesFromPrevious: Boolean(raw?.continuesFromPrevious),
    region: {
      page,
      x: clamp01(region.x),
      y: clamp01(region.y),
      w: clamp01(region.w),
      h: clamp01(region.h),
    },
  };
}

function clamp01(v: any): number {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
