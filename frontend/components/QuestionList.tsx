"use client";

import { useState } from "react";
import { AnswerRegion, GradingResult, Question, QuestionMapping } from "@/lib/types";
import { ChevronDownIcon } from "./icons";
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

function getScoreVariant(marks: number, maxMarks: number): "success" | "warning" | "danger" {
  if (marks === 0) return "danger";
  if (marks >= maxMarks) return "success";
  return "warning";
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  const gradingByQuestionId = new Map((grading ?? []).map((g) => [g.questionId, g]));

  const sorted = [...questions].sort((a, b) => a.order - b.order);
  const unmatched = answerRegions.filter((a) => unmatchedAnswerIds.includes(a.id));

  function toggleExpand(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleExpandAll() {
    if (expandAll) {
      setExpandedIds(new Set());
      setExpandAll(false);
    } else {
      setExpandedIds(new Set(sorted.map((q) => q.id)));
      setExpandAll(true);
    }
  }

  function isExpanded(id: string) {
    return expandAll || expandedIds.has(id) || selectedQuestionId === id;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Extracted Questions (from question paper)</h2>
        <button className={styles.expandAllBtn} onClick={handleExpandAll}>
          {expandAll ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <div className={styles.list}>
        {sorted.map((q) => {
          const g = gradingByQuestionId.get(q.id);
          const expanded = isExpanded(q.id);
          const selected = selectedQuestionId === q.id;
          const hasGrading = g && g.marks !== null;

          return (
            <div
              key={q.id}
              className={`${styles.card} ${selected ? styles.selected : ""} ${expanded ? styles.expanded : ""}`}
              onClick={() => onSelectQuestion(q.id)}
            >
              <div className={styles.cardHeader}>
                <span className={`${styles.number} ${selected ? styles.numberActive : ""}`}>{q.number}</span>
                {hasGrading && (
                  <span
                    className={`${styles.score} ${styles[getScoreVariant(g.marks!, g.maxMarks)]}`}
                  >
                    {g.marks}/{g.maxMarks}
                  </span>
                )}
                <button
                  className={`${styles.chevron} ${expanded ? styles.chevronUp : ""}`}
                  onClick={(e) => toggleExpand(q.id, e)}
                  aria-label={expanded ? "Collapse" : "Expand"}
                >
                  <ChevronDownIcon />
                </button>
              </div>

              <p className={styles.questionText}>{q.text || "(no question text extracted)"}</p>

              {expanded && g?.feedback && (
                <div className={styles.feedback}>
                  <div className={styles.feedbackTitle}>AI Feedback</div>
                  <p className={styles.feedbackText}>{g.feedback}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {unmatched.length > 0 && (
        <div className={styles.unmatchedSection}>
          <div className={styles.unmatchedTitle}>Unmatched answers ({unmatched.length})</div>
          {unmatched.map((a) => (
            <div
              key={a.id}
              className={`${styles.unmatchedItem} ${selectedUnmatchedId === a.id ? styles.unmatchedSelected : ""}`}
              onClick={() => onSelectUnmatched(a.id)}
            >
              {a.label ? `Labelled "${a.label}"` : "Unlabelled answer"} &mdash;{" "}
              {a.text ? a.text.slice(0, 80) : "(no text)"}
              {a.text.length > 80 ? "…" : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
