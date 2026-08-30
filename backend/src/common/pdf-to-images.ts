import { createCanvas, loadImage } from "@napi-rs/canvas";
import { PageImage } from "./types";

const IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

// Cap the longest edge sent to OpenAI vision. Vision token cost scales with image pixel area
// (512x512 tiles at "high" detail), and per-request token budgets on some accounts are tight --
// keeping every image at a predictable, bounded size keeps per-call cost predictable regardless
// of how high-resolution the source scan is.
const MAX_DIMENSION = 1536;

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
    return [await normalizeImage(buffer)];
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
    const baseViewport = page.getViewport({ scale: 1.0 });
    // Render at a scale that lands close to MAX_DIMENSION on the longest edge -- sharp enough for
    // handwriting OCR without producing an oversized (and token-expensive) image.
    const scale = Math.min(2.5, MAX_DIMENSION / Math.max(baseViewport.width, baseViewport.height));
    const viewport = page.getViewport({ scale: Math.max(scale, 0.5) });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({ canvasContext: context as any, viewport }).promise;

    const dataUrl = canvas.toDataURL("image/png");
    pages.push({ page: pageNum, dataUrl, width: viewport.width, height: viewport.height });
  }

  return pages;
}

async function normalizeImage(buffer: Buffer): Promise<PageImage> {
  const img = await loadImage(buffer);
  if (img.width <= MAX_DIMENSION && img.height <= MAX_DIMENSION) {
    // Small enough already -- re-encode through canvas anyway so callers always get a plain PNG data URL.
    const canvas = createCanvas(img.width, img.height);
    canvas.getContext("2d").drawImage(img, 0, 0);
    return { page: 1, dataUrl: canvas.toDataURL("image/png"), width: img.width, height: img.height };
  }

  const scale = MAX_DIMENSION / Math.max(img.width, img.height);
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);
  const canvas = createCanvas(width, height);
  canvas.getContext("2d").drawImage(img, 0, 0, width, height);
  return { page: 1, dataUrl: canvas.toDataURL("image/png"), width, height };
}
