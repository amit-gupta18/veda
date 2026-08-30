"use client";

import { useMemo, useState } from "react";
import {
  AnswerRegion,
  GradingResult,
  PageImage,
  Question,
  QuestionMapping,
} from "@/lib/types";
import QuestionList from "./QuestionList";
import AnswerViewer from "./AnswerViewer";
import GradingSummary from "./GradingSummary";
import styles from "./ResultsView.module.css";

interface ResultsViewProps {
  questions: Question[];
  mapping: QuestionMapping[];
  answerRegions: AnswerRegion[];
  unmatchedAnswerIds: string[];
  answerPages: PageImage[];
  grading: GradingResult[] | null;
  gradingSummary: string | null;
  onReset: () => void;
}

export default function ResultsView({
  questions,
  mapping,
  answerRegions,
  unmatchedAnswerIds,
  answerPages,
  grading,
  gradingSummary,
  onReset,
}: ResultsViewProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedUnmatchedId, setSelectedUnmatchedId] = useState<string | null>(null);

  const answerById = useMemo(() => new Map(answerRegions.map((a) => [a.id, a])), [answerRegions]);
  const mappingByQuestionId = useMemo(() => new Map(mapping.map((m) => [m.questionId, m])), [mapping]);

  const allRegions = useMemo(() => answerRegions.flatMap((a) => a.regions), [answerRegions]);

  const activeRegions = useMemo(() => {
    if (selectedUnmatchedId) {
      return answerById.get(selectedUnmatchedId)?.regions ?? [];
    }
    if (selectedQuestionId) {
      const m = mappingByQuestionId.get(selectedQuestionId);
      if (m?.answerRegionId) {
        return answerById.get(m.answerRegionId)?.regions ?? [];
      }
    }
    return [];
  }, [selectedQuestionId, selectedUnmatchedId, mappingByQuestionId, answerById]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>Assessment results</h1>
        <button className={styles.resetBtn} onClick={onReset}>
          Start over
        </button>
      </div>

      <div className={styles.body}>
        <div className={`${styles.col} ${styles.questionCol}`}>
          <div className={styles.colHeading}>Questions ({questions.length})</div>
          <QuestionList
            questions={questions}
            mapping={mapping}
            answerRegions={answerRegions}
            unmatchedAnswerIds={unmatchedAnswerIds}
            grading={grading}
            selectedQuestionId={selectedQuestionId}
            selectedUnmatchedId={selectedUnmatchedId}
            onSelectQuestion={(id) => {
              setSelectedQuestionId(id);
              setSelectedUnmatchedId(null);
            }}
            onSelectUnmatched={(id) => {
              setSelectedUnmatchedId(id);
              setSelectedQuestionId(null);
            }}
          />
        </div>

        <div className={`${styles.col} ${styles.answerCol}`}>
          <AnswerViewer pages={answerPages} activeRegions={activeRegions} allRegions={allRegions} />
        </div>

        {grading && gradingSummary !== null && (
          <div className={`${styles.col} ${styles.gradingCol}`}>
            <div className={styles.colHeading} style={{ padding: "14px 12px 0" }}>
              Grading
            </div>
            <GradingSummary
              questions={questions}
              grading={grading}
              summary={gradingSummary}
              selectedQuestionId={selectedQuestionId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
