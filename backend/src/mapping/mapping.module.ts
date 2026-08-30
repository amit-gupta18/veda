import { Router } from "express";
import { asyncHandler } from "../common/error.middleware";
import { mapHandler } from "./mapping.controller";

export function createMappingModule(): Router {
  const router = Router();
  router.post("/", asyncHandler(mapHandler));
  return router;
}
