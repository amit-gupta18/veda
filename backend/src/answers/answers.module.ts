import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../common/error.middleware";
import { extractAnswersHandler } from "./answers.controller";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

export function createAnswersModule(): Router {
  const router = Router();
  router.post("/extract", upload.single("answerSheet"), asyncHandler(extractAnswersHandler));
  return router;
}
