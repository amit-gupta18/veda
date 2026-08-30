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

  const label = `vision:${params.images.map((i) => i.page).join(",")}`;
  const startedAt = Date.now();
  console.log(`[openai] -> ${label} model=${VISION_MODEL} images=${params.images.length}`);

  const response = await withRetry(() =>
    openai.chat.completions.create({
      model: VISION_MODEL,
      max_tokens: params.maxTokens ?? 2048,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content },
      ],
    }),
    label
  );

  console.log(
    `[openai] <- ${label} took=${Date.now() - startedAt}ms usage=${JSON.stringify(response.usage ?? {})}`
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
// Cap how long we're willing to actually wait out a 429 -- a per-minute limit resets in seconds
// and is worth retrying, but a per-day limit can ask for 20+ minutes, which would just hang the
// request. Past this ceiling we fail fast with a clear message instead of stalling silently.
const MAX_RETRY_WAIT_MS = 30_000;

async function withRetry<T>(fn: () => Promise<T>, label = "call", attempts = 8): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (err?.status !== 429) throw err;

      const message = String(err?.message ?? "");
      const isDailyLimit = /requests per day|RPD/i.test(message);

      const retryAfterHeader = err?.headers?.["retry-after"];
      const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : null;
      const backoffMs = retryAfterMs && !Number.isNaN(retryAfterMs) ? retryAfterMs : 1000 * Math.pow(1.6, i);
      const delayMs = Math.max(backoffMs, 2000) + 500;

      if (isDailyLimit || delayMs > MAX_RETRY_WAIT_MS || i === attempts - 1) {
        console.error(`[openai] 429 on ${label} -- giving up (dailyLimit=${isDailyLimit}): ${message}`);
        throw isDailyLimit
          ? new Error(
              "The OpenAI account's daily request quota has been used up for today. Please try again after " +
                "the quota resets, or use a key with a higher tier / a payment method attached."
            )
          : err;
      }

      console.warn(
        `[openai] 429 on ${label} attempt=${i + 1}/${attempts} waiting=${delayMs}ms message=${message}`
      );
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
  const startedAt = Date.now();
  console.log(`[openai] -> text model=${VISION_MODEL} promptLen=${params.userPrompt.length}`);

  const response = await withRetry(
    () =>
      openai.chat.completions.create({
        model: VISION_MODEL,
        max_tokens: params.maxTokens ?? 1536,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: params.userPrompt },
        ],
      }),
    "text"
  );

  console.log(`[openai] <- text took=${Date.now() - startedAt}ms usage=${JSON.stringify(response.usage ?? {})}`);

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
