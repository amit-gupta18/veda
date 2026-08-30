"use client";

import { AnswerRegion, GradingResult, Question, QuestionMapping } from "@/lib/types";
import styles from "./QuestionList.module.css";

interface QuestionListProps {
  questions: Question[];
  mapping: QuestionMapping[];
  answerRegions: AnswerRegion[];
  unmatchedAnswerIds: string[];
  grading: GradingResult[] | null;
  selectedQuestionId: string | null;
  selectedUnmatchedId: string | null;
  onSelectQuestion: (id: string) => void;
  onSelectUnmatched: (id: string) => void;
}

export default function QuestionList({
  questions,
  mapping,
  answerRegions,
  unmatchedAnswerIds,
  grading,
  selectedQuestionId,
  selectedUnmatchedId,
  onSelectQuestion,
  onSelectUnmatched,
}: QuestionListProps) {
  const mappingByQuestionId = new Map(mapping.map((m) => [m.questionId, m]));
  const gradingByQuestionId = new Map((grading ?? []).map((g) => [g.questionId, g]));
  const answerById = new Map(answerRegions.map((a) => [a.id, a]));

  const sorted = [...questions].sort((a, b) => a.order - b.order);
  const unmatched = answerRegions.filter((a) => unmatchedAnswerIds.includes(a.id));

  return (
    <div>
      <div className={styles.list}>
        {sorted.map((q) => {
          const m = mappingByQuestionId.get(q.id);
          const g = gradingByQuestionId.get(q.id);
          const isAnswered = m?.status === "answered";
          const answer = m?.answerRegionId ? answerById.get(m.answerRegionId) : undefined;

          return (
            <button
              key={q.id}
              className={`${styles.item} ${q.parentNumber ? styles.subpart : ""} ${
                selectedQuestionId === q.id ? styles.selected : ""
              }`}
              onClick={() => onSelectQuestion(q.id)}
            >
              <span className={styles.number}>{q.number}</span>
              <span className={styles.body}>
                <span className={styles.text}>{q.text || "(no question text extracted)"}</span>
                <span className={styles.metaRow}>
                  <span className={`${styles.badge} ${isAnswered ? styles.answered : styles.unanswered}`}>
                    {isAnswered ? "Answered" : "Not answered"}
                  </span>
                  {isAnswered && m?.matchType === "semantic" && (
                    <span className={`${styles.badge} ${styles.semantic}`}>Inferred match</span>
                  )}
                  {g && g.marks !== null && (
                    <span className={styles.marks}>
                      {g.marks}/{g.maxMarks} marks
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {unmatched.length > 0 && (
        <>
          <div className={styles.sectionTitle}>Unmatched answers ({unmatched.length})</div>
          {unmatched.map((a) => (
            <div
              key={a.id}
              className={styles.unmatchedItem}
              onClick={() => onSelectUnmatched(a.id)}
              style={selectedUnmatchedId === a.id ? { borderColor: "var(--warning)" } : undefined}
            >
              {a.label ? `Labelled "${a.label}"` : "Unlabelled answer"} &mdash;{" "}
              {a.text ? a.text.slice(0, 80) : "(no text)"}
              {a.text.length > 80 ? "…" : ""}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
