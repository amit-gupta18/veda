import { Router } from "express";
import { asyncHandler } from "../common/error.middleware";
import { gradeHandler } from "./grading.controller";

export function createGradingModule(): Router {
  const router = Router();
  router.post("/", asyncHandler(gradeHandler));
  return router;
}
