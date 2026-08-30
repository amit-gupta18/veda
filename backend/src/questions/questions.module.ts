import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../common/error.middleware";
import { extractQuestionsHandler } from "./questions.controller";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

export function createQuestionsModule(): Router {
  const router = Router();
  router.post("/extract", upload.single("questionPaper"), asyncHandler(extractQuestionsHandler));
  return router;
}
