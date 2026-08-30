export interface BBox {
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Question {
  id: string;
  number: string;
  parentNumber?: string;
  text: string;
  order: number;
}

export interface AnswerRegion {
  id: string;
  label: string | null;
  text: string;
  regions: BBox[];
}

export type MappingStatus = "answered" | "unanswered";

export interface QuestionMapping {
  questionId: string;
  status: MappingStatus;
  answerRegionId: string | null;
  matchType: "label" | "semantic" | null;
  confidence: number;
}

export interface GradingResult {
  questionId: string;
  isCorrect: boolean | null;
  marks: number | null;
  maxMarks: number;
  feedback: string;
}

export interface PageImage {
  page: number;
  dataUrl: string;
  width: number;
  height: number;
}

export interface ExtractQuestionsResponse {
  sessionId: string;
  questions: Question[];
  pages: PageImage[];
}

export interface ExtractAnswersResponse {
  answerRegions: AnswerRegion[];
  pages: PageImage[];
}

export interface MapResponse {
  mapping: QuestionMapping[];
  unmatchedAnswerIds: string[];
}

export interface GradeResponse {
  grading: GradingResult[];
  summary: string;
}
