import { Request, Response } from "express";
import { getSession, updateSession } from "../common/session-store";
import { mapAnswersToQuestions } from "./mapping.service";
import { MapResponse } from "./mapping.dto";

export async function mapHandler(req: Request, res: Response) {
  const { sessionId } = req.body ?? {};
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "sessionId is required" });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: "Unknown sessionId" });
  }
  if (!session.questions || !session.answerRegions) {
    return res.status(400).json({ error: "Questions and answers must be extracted before mapping" });
  }

  const { mapping, unmatchedAnswerIds } = await mapAnswersToQuestions(session.questions, session.answerRegions);
  updateSession(sessionId, { mapping, unmatchedAnswerIds });

  const body: MapResponse = { mapping, unmatchedAnswerIds };
  res.json(body);
}
