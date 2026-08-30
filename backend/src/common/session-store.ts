import { v4 as uuid } from "uuid";
import { SessionData } from "./types";

const store = new Map<string, SessionData>();

// Sweep sessions older than this so memory doesn't grow unbounded across a long-lived process.
const SESSION_TTL_MS = 1000 * 60 * 60 * 2; // 2 hours

export function createSession(): SessionData {
  const session: SessionData = { id: uuid(), createdAt: Date.now() };
  store.set(session.id, session);
  return session;
}

export function getSession(id: string): SessionData | undefined {
  sweep();
  return store.get(id);
}

export function updateSession(id: string, patch: Partial<SessionData>): SessionData {
  const existing = store.get(id);
  if (!existing) {
    throw new Error(`Session not found: ${id}`);
  }
  const updated = { ...existing, ...patch };
  store.set(id, updated);
  return updated;
}

function sweep() {
  const now = Date.now();
  for (const [id, session] of store.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      store.delete(id);
    }
  }
}
