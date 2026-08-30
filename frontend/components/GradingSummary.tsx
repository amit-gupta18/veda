"use client";

import { GradingResult, Question } from "@/lib/types";
import styles from "./GradingSummary.module.css";

interface GradingSummaryProps {
  questions: Question[];
  grading: GradingResult[];
  summary: string;
  selectedQuestionId: string | null;
}

export default function GradingSummary({ questions, grading, summary, selectedQuestionId }: GradingSummaryProps) {
  const gradingByQuestionId = new Map(grading.map((g) => [g.questionId, g]));
  const questionById = new Map(questions.map((q) => [q.id, q]));

  const totalMarks = grading.reduce((sum, g) => sum + (g.marks ?? 0), 0);
  const totalMax = grading.reduce((sum, g) => sum + g.maxMarks, 0);

  const selected = selectedQuestionId ? gradingByQuestionId.get(selectedQuestionId) : null;
  const selectedQuestion = selectedQuestionId ? questionById.get(selectedQuestionId) : null;

  return (
    <div className={styles.panel}>
      <div className={styles.scoreRow}>
        <span className={styles.scoreValue}>{totalMarks}</span>
        <span className={styles.scoreOf}>/ {totalMax} marks</span>
      </div>
      <div className={styles.summaryText}>{summary}</div>

      {selected && selectedQuestion && (
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <span className={styles.detailNumber}>{selectedQuestion.number}</span>
            {selected.marks !== null ? (
              <span
                className={`${styles.detailMarks} ${selected.isCorrect ? styles.correct : styles.incorrect}`}
              >
                {selected.marks}/{selected.maxMarks}
              </span>
            ) : (
              <span className={styles.detailMarks}>&mdash;</span>
            )}
          </div>
          <div className={styles.detailFeedback}>{selected.feedback}</div>
        </div>
      )}
    </div>
  );
}
