import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export const VISION_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

interface ImageInput {
  dataUrl: string;
  page: number;
}

/**
 * Calls the OpenAI chat completions API with one or more images plus a text prompt,
 * enforcing a JSON object response. The caller is responsible for validating/parsing
 * the returned JSON shape.
 */
export async function callVisionJson(params: {
  systemPrompt: string;
  userPrompt: string;
  images: ImageInput[];
  maxTokens?: number;
}): Promise<any> {
  const openai = getOpenAIClient();

  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: "text", text: params.userPrompt },
    ...params.images.map((img) => ({
      type: "image_url" as const,
      image_url: { url: img.dataUrl, detail: "high" as const },
    })),
  ];

  const response = await withRetry(() =>
    openai.chat.completions.create({
      model: VISION_MODEL,
      max_tokens: params.maxTokens ?? 2048,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content },
      ],
    })
  );

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from OpenAI");
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse OpenAI JSON response: ${(err as Error).message}\nRaw: ${raw}`);
  }
}

/**
 * Retries a single OpenAI call on 429 (rate limit) with a short backoff -- these accounts often
 * have low per-minute token/request caps, and a brief wait is usually enough for the window to reset.
 */
async function withRetry<T>(fn: () => Promise<T>, attempts = 8): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (err?.status !== 429 || i === attempts - 1) throw err;
      const retryAfterHeader = err?.headers?.["retry-after"];
      const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : null;
      const backoffMs = retryAfterMs && !Number.isNaN(retryAfterMs) ? retryAfterMs : 1000 * Math.pow(1.6, i);
      const delayMs = Math.max(backoffMs, 2000) + 500;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastErr;
}

/** Simple sleep helper for pacing sequential per-page calls under a low requests-per-minute cap. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Text-only JSON call (used for mapping fallback / grading where images aren't needed again).
 */
export async function callTextJson(params: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}): Promise<any> {
  const openai = getOpenAIClient();
  const response = await withRetry(() =>
    openai.chat.completions.create({
      model: VISION_MODEL,
      max_tokens: params.maxTokens ?? 1536,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
    })
  );

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from OpenAI");
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse OpenAI JSON response: ${(err as Error).message}\nRaw: ${raw}`);
  }
}
