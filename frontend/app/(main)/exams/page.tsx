"use client";

import { useState } from "react";
import UploadPanel from "@/components/UploadPanel";
import ProgressView, { Stage } from "@/components/ProgressView";
import ResultsView from "@/components/ResultsView";
import { useShellConfig } from "@/components/ShellContext";
import { extractAnswers, extractQuestions, gradeAnswers, mapAnswers } from "@/lib/api";
import {
  AnswerRegion,
  GradingResult,
  PageImage,
  Question,
  QuestionMapping,
} from "@/lib/types";

type ViewState = "upload" | "processing" | "results";

const STAGE_LABELS = [
  { key: "questions", label: "Extracting questions from the paper" },
  { key: "answers", label: "Extracting answers from the sheet" },
  { key: "mapping", label: "Mapping answers to questions" },
  { key: "grading", label: "Grading & generating feedback" },
];

export default function ExamsPage() {
  const [view, setView] = useState<ViewState>("upload");
  const [stages, setStages] = useState<Stage[]>(
    STAGE_LABELS.map((s) => ({ ...s, status: "pending" as const }))
  );
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerRegions, setAnswerRegions] = useState<AnswerRegion[]>([]);
  const [answerPages, setAnswerPages] = useState<PageImage[]>([]);
  const [mapping, setMapping] = useState<QuestionMapping[]>([]);
  const [unmatchedAnswerIds, setUnmatchedAnswerIds] = useState<string[]>([]);
  const [grading, setGrading] = useState<GradingResult[] | null>(null);
  const [gradingSummary, setGradingSummary] = useState<string | null>(null);

  useShellConfig({
    collapsed: view !== "upload",
    mobileMinimal: view === "results",
    breadcrumb: "Exams",
  });

  function setStageStatus(key: string, status: Stage["status"]) {
    setStages((prev) => prev.map((s) => (s.key === key ? { ...s, status } : s)));
  }

  async function handleSubmit(questionPaper: File, answerSheet: File) {
    setError(null);
    setStages(STAGE_LABELS.map((s) => ({ ...s, status: "pending" as const })));
    setView("processing");

    try {
      setStageStatus("questions", "active");
      const qRes = await extractQuestions(questionPaper);
      setStageStatus("questions", "done");
      setQuestions(qRes.questions);

      setStageStatus("answers", "active");
      const aRes = await extractAnswers(qRes.sessionId, answerSheet);
      setStageStatus("answers", "done");
      setAnswerRegions(aRes.answerRegions);
      setAnswerPages(aRes.pages);

      setStageStatus("mapping", "active");
      const mRes = await mapAnswers(qRes.sessionId);
      setStageStatus("mapping", "done");
      setMapping(mRes.mapping);
      setUnmatchedAnswerIds(mRes.unmatchedAnswerIds);

      setStageStatus("grading", "active");
      try {
        const gRes = await gradeAnswers(qRes.sessionId);
        setGrading(gRes.grading);
        setGradingSummary(gRes.summary);
        setStageStatus("grading", "done");
      } catch (gradeErr) {
        console.error(gradeErr);
        setStageStatus("grading", "error");
      }

      setView("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while processing.");
      setView("upload");
    }
  }

  function handleReset() {
    setView("upload");
    setQuestions([]);
    setAnswerRegions([]);
    setAnswerPages([]);
    setMapping([]);
    setUnmatchedAnswerIds([]);
    setGrading(null);
    setGradingSummary(null);
    setError(null);
  }

  if (view === "processing") {
    return <ProgressView stages={stages} />;
  }

  if (view === "results") {
    return (
      <ResultsView
        questions={questions}
        mapping={mapping}
        answerRegions={answerRegions}
        unmatchedAnswerIds={unmatchedAnswerIds}
        answerPages={answerPages}
        grading={grading}
        gradingSummary={gradingSummary}
        onReset={handleReset}
      />
    );
  }

  return <UploadPanel onSubmit={handleSubmit} error={error} />;
}
