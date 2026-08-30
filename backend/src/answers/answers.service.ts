import { callVisionJson } from "../common/openai.client";
import { AnswerRegion, BBox, PageImage } from "../common/types";

const SYSTEM_PROMPT = `You are an expert at reading handwritten exam answer sheets. You will be shown one or more
page images of a student's answer sheet, in page order (page 1 is the first image, etc.).

For EACH distinct answer the student has written, produce one entry with:
- "label": the question number/label the student explicitly wrote next to the answer (e.g. "11(a)", "Q3",
  "2 b)"), normalized to look like "11(a)" style where possible. If the student wrote NO discernible label,
  set this to null.
- "text": your best transcription of the handwritten answer content (doesn't need to be perfect, just
  representative).
- "regions": an array of bounding boxes, one per page the answer spans, each as
  { "page": <1-indexed page number as given>, "x": <left, 0-1 normalized to page width>,
    "y": <top, 0-1 normalized to page height>, "w": <width, 0-1>, "h": <height, 0-1> }.
  Boxes should tightly enclose the handwritten content for that answer on that page, INCLUDING any diagrams
  drawn as part of the answer. If an answer continues across multiple pages, include multiple region entries.

Rules:
- Treat clearly separate answers (different handwriting blocks, often separated by a written label or by
  blank space) as separate entries, even if unlabeled.
- Do not merge multiple distinct answers into one entry.
- Do not skip content that doesn't look labelled -- still capture it as an entry with label: null.

Return STRICT JSON only, matching this shape:
{
  "answers": [
    { "label": "11(a)", "text": "...", "regions": [ { "page": 1, "x": 0.1, "y": 0.2, "w": 0.8, "h": 0.15 } ] }
  ]
}`;

export async function extractAnswers(pages: PageImage[]): Promise<AnswerRegion[]> {
  const userPrompt = `Here are ${pages.length} page image(s) of a student's answer sheet, in order. Extract all
answer regions per the rules in the system prompt.`;

  const result = await callVisionJson({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    images: pages.map((p) => ({ dataUrl: p.dataUrl, page: p.page })),
  });

  const rawAnswers: any[] = Array.isArray(result?.answers) ? result.answers : [];

  return rawAnswers.map((a, idx) => ({
    id: `a-${idx + 1}`,
    label: a.label ? String(a.label) : null,
    text: String(a.text ?? "").trim(),
    regions: normalizeRegions(a.regions),
  }));
}

function normalizeRegions(regions: any): BBox[] {
  if (!Array.isArray(regions)) return [];
  return regions
    .filter((r) => r && typeof r === "object")
    .map((r) => ({
      page: clampInt(r.page, 1),
      x: clamp01(r.x),
      y: clamp01(r.y),
      w: clamp01(r.w),
      h: clamp01(r.h),
    }));
}

function clamp01(v: any): number {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function clampInt(v: any, min: number): number {
  const n = Math.round(Number(v));
  if (Number.isNaN(n)) return min;
  return Math.max(min, n);
}
