import { Request, Response } from "express";
import { getSession, updateSession } from "../common/session-store";
import { gradeAnswers } from "./grading.service";
import { GradeResponse } from "./grading.dto";

export async function gradeHandler(req: Request, res: Response) {
  const { sessionId } = req.body ?? {};
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "sessionId is required" });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: "Unknown sessionId" });
  }
  if (!session.questions || !session.answerRegions || !session.mapping) {
    return res.status(400).json({ error: "Mapping must be completed before grading" });
  }

  const { grading, summary } = await gradeAnswers(session.questions, session.answerRegions, session.mapping);
  updateSession(sessionId, { grading, gradingSummary: summary });

  const body: GradeResponse = { grading, summary };
  res.json(body);
}
