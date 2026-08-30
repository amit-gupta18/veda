import { Request, Response } from "express";
import { createSession, updateSession } from "../common/session-store";
import { fileToPageImages } from "../common/pdf-to-images";
import { extractQuestions } from "./questions.service";
import { ExtractQuestionsResponse } from "./questions.dto";

export async function extractQuestionsHandler(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "questionPaper file is required" });
  }

  const pages = await fileToPageImages(file.buffer, file.mimetype);
  const questions = await extractQuestions(pages);

  const session = createSession();
  updateSession(session.id, { questionPaperPages: pages, questions });

  const body: ExtractQuestionsResponse = { sessionId: session.id, questions, pages };
  res.json(body);
}
