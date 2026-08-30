import { Request, Response } from "express";
import { getSession, updateSession } from "../common/session-store";
import { fileToPageImages } from "../common/pdf-to-images";
import { extractAnswers } from "./answers.service";
import { ExtractAnswersResponse } from "./answers.dto";

export async function extractAnswersHandler(req: Request, res: Response) {
  const file = req.file;
  const sessionId = req.body.sessionId;

  if (!file) {
    return res.status(400).json({ error: "answerSheet file is required" });
  }
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "sessionId is required" });
  }
  if (!getSession(sessionId)) {
    return res.status(404).json({ error: "Unknown sessionId" });
  }

  const pages = await fileToPageImages(file.buffer, file.mimetype);
  const answerRegions = await extractAnswers(pages);

  updateSession(sessionId, { answerSheetPages: pages, answerRegions });

  const body: ExtractAnswersResponse = { answerRegions, pages };
  res.json(body);
}
