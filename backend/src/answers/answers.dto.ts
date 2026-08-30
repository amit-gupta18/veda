import { AnswerRegion, PageImage } from "../common/types";

export interface ExtractAnswersResponse {
  answerRegions: AnswerRegion[];
  pages: PageImage[];
}
