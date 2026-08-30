import { GradingResult } from "../common/types";

export interface GradeResponse {
  grading: GradingResult[];
  summary: string;
}
