import { QuestionMapping } from "../common/types";

export interface MapResponse {
  mapping: QuestionMapping[];
  unmatchedAnswerIds: string[];
}
