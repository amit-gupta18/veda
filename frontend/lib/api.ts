import {
  ExtractAnswersResponse,
  ExtractQuestionsResponse,
  GradeResponse,
  MapResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function parseOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function extractQuestions(file: File): Promise<ExtractQuestionsResponse> {
  const form = new FormData();
  form.append("questionPaper", file);
  const res = await fetch(`${API_URL}/api/questions/extract`, { method: "POST", body: form });
  return parseOrThrow(res);
}

export async function extractAnswers(sessionId: string, file: File): Promise<ExtractAnswersResponse> {
  const form = new FormData();
  form.append("sessionId", sessionId);
  form.append("answerSheet", file);
  const res = await fetch(`${API_URL}/api/answers/extract`, { method: "POST", body: form });
  return parseOrThrow(res);
}

export async function mapAnswers(sessionId: string): Promise<MapResponse> {
  const res = await fetch(`${API_URL}/api/map`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  return parseOrThrow(res);
}

export async function gradeAnswers(sessionId: string): Promise<GradeResponse> {
  const res = await fetch(`${API_URL}/api/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  return parseOrThrow(res);
}
