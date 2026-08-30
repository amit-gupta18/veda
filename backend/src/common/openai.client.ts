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

  const response = await openai.chat.completions.create({
    model: VISION_MODEL,
    max_tokens: params.maxTokens ?? 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content },
    ],
  });

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
 * Text-only JSON call (used for mapping fallback / grading where images aren't needed again).
 */
export async function callTextJson(params: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}): Promise<any> {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: VISION_MODEL,
    max_tokens: params.maxTokens ?? 2048,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
  });

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
