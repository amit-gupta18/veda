import { createCanvas, loadImage } from "@napi-rs/canvas";
import { PageImage } from "./types";

const IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

// pdfjs-dist ships as ESM only; dynamic import() lets this CommonJS module load it at runtime.
let pdfjsLibPromise: Promise<any> | null = null;
function getPdfjsLib() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import("pdfjs-dist/legacy/build/pdf.mjs");
  }
  return pdfjsLibPromise;
}

/**
 * Converts an uploaded file (PDF or a single image) into one or more page images
 * usable both for OpenAI vision input and for rendering in the frontend.
 */
export async function fileToPageImages(buffer: Buffer, mimetype: string): Promise<PageImage[]> {
  if (mimetype === "application/pdf") {
    return rasterizePdf(buffer);
  }
  if (IMAGE_MIME_TYPES.has(mimetype)) {
    // We don't know pixel dimensions without decoding; canvas isn't needed here since
    // browsers/OpenAI can read the raw image. We still probe dimensions via canvas for consistency.
    const { width, height } = await probeImageSize(buffer);
    const dataUrl = `data:${mimetype};base64,${buffer.toString("base64")}`;
    return [{ page: 1, dataUrl, width, height }];
  }
  throw new Error(`Unsupported file type: ${mimetype}`);
}

async function rasterizePdf(buffer: Buffer): Promise<PageImage[]> {
  const pdfjsLib = await getPdfjsLib();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const pages: PageImage[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 }); // 2x for legible OCR of handwriting
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({ canvasContext: context as any, viewport }).promise;

    const dataUrl = canvas.toDataURL("image/png");
    pages.push({ page: pageNum, dataUrl, width: viewport.width, height: viewport.height });
  }

  return pages;
}

async function probeImageSize(buffer: Buffer): Promise<{ width: number; height: number }> {
  const img = await loadImage(buffer);
  return { width: img.width, height: img.height };
}
