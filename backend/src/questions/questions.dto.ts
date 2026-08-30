import { PageImage, Question } from "../common/types";

export interface ExtractQuestionsResponse {
  sessionId: string;
  questions: Question[];
  pages: PageImage[];
}
