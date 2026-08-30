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

type MobileTab = "questions" | "answerSheet";

export default function ResultsView({
  questions,
  mapping,
  answerRegions,
  unmatchedAnswerIds,
  answerPages,
  grading,
  onReset: _onReset,
}: ResultsViewProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedUnmatchedId, setSelectedUnmatchedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("questions");

  const answerById = useMemo(() => new Map(answerRegions.map((a) => [a.id, a])), [answerRegions]);
  const mappingByQuestionId = useMemo(() => new Map(mapping.map((m) => [m.questionId, m])), [mapping]);
  const questionById = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);

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

  const questionLabel = selectedQuestionId
    ? questionById.get(selectedQuestionId)?.number ?? null
    : null;

  return (
    <div className={styles.wrap}>
      <div className={styles.mobileTabs}>
        <button
          className={`${styles.tab} ${mobileTab === "questions" ? styles.tabActive : ""}`}
          onClick={() => setMobileTab("questions")}
        >
          Questions
        </button>
        <button
          className={`${styles.tab} ${mobileTab === "answerSheet" ? styles.tabActive : ""}`}
          onClick={() => setMobileTab("answerSheet")}
        >
          Answer Sheet
        </button>
      </div>

      <div className={styles.body}>
        <div
          className={`${styles.questionCol} ${mobileTab === "questions" ? styles.mobileVisible : styles.mobileHidden}`}
        >
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

        <div
          className={`${styles.answerCol} ${mobileTab === "answerSheet" ? styles.mobileVisible : styles.mobileHidden}`}
        >
          <AnswerViewer
            pages={answerPages}
            activeRegions={activeRegions}
            allRegions={allRegions}
            questionLabel={questionLabel}
          />
        </div>
      </div>
    </div>
  );
}
