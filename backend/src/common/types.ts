export interface BBox {
  page: number; // 1-indexed page number within the relevant document (question paper or answer sheet)
  x: number; // normalized 0-1, left
  y: number; // normalized 0-1, top
  w: number; // normalized 0-1, width
  h: number; // normalized 0-1, height
}

export interface Question {
  id: string; // stable id, e.g. "q-11-a"
  number: string; // printed label, e.g. "11(a)"
  parentNumber?: string; // "11" if this is a sub-part
  text: string;
  order: number; // printed order index, 0-based
}

export interface AnswerRegion {
  id: string; // e.g. "a-1"
  label: string | null; // explicit label student wrote, e.g. "11 a)" -- null if none
  text: string; // OCR'd/transcribed text of the answer
  regions: BBox[]; // one or more regions (multi-page answers)
}

export type MappingStatus = "answered" | "unanswered";

export interface QuestionMapping {
  questionId: string;
  status: MappingStatus;
  answerRegionId: string | null;
  matchType: "label" | "semantic" | null;
  confidence: number; // 0-1
}

export interface GradingResult {
  questionId: string;
  isCorrect: boolean | null; // null if unanswered / ungradable
  marks: number | null;
  maxMarks: number;
  feedback: string;
}

export interface PageImage {
  page: number;
  dataUrl: string; // data:image/png;base64,...
  width: number;
  height: number;
}

export interface SessionData {
  id: string;
  createdAt: number;
  questionPaperPages?: PageImage[];
  answerSheetPages?: PageImage[];
  questions?: Question[];
  answerRegions?: AnswerRegion[];
  mapping?: QuestionMapping[];
  unmatchedAnswerIds?: string[];
  grading?: GradingResult[];
  gradingSummary?: string;
}
