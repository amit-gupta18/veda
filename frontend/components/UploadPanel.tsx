"use client";

import { useRef, useState } from "react";
import styles from "./UploadPanel.module.css";

const ACCEPTED = ".pdf,image/*";

interface DropzoneProps {
  label: string;
  hint: string;
  file: File | null;
  onFile: (file: File | null) => void;
}

function Dropzone({ label, hint, file, onFile }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);

  return (
    <div
      className={`${styles.dropzone} ${active ? styles.active : ""} ${file ? styles.filled : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setActive(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) onFile(dropped);
      }}
    >
      <div className={styles.icon}>{file ? "✓" : "📄"}</div>
      <div className={styles.label}>{label}</div>
      {file ? <div className={styles.fileName}>{file.name}</div> : <div className={styles.hint}>{hint}</div>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className={styles.input}
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

interface UploadPanelProps {
  onSubmit: (questionPaper: File, answerSheet: File) => void;
  error: string | null;
}

export default function UploadPanel({ onSubmit, error }: UploadPanelProps) {
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);

  const canSubmit = Boolean(questionPaper && answerSheet);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI Assessment Extraction &amp; Answer Mapping</h1>
        <p className={styles.subtitle}>
          Upload a question paper and a student&rsquo;s handwritten answer sheet. We&rsquo;ll extract every
          question, locate each answer, and highlight exactly where it appears.
        </p>
      </div>

      <div className={styles.grid}>
        <Dropzone
          label="Question paper"
          hint="PDF or image · click or drag to upload"
          file={questionPaper}
          onFile={setQuestionPaper}
        />
        <Dropzone
          label="Student answer sheet"
          hint="PDF or image · click or drag to upload"
          file={answerSheet}
          onFile={setAnswerSheet}
        />
      </div>

      <div className={styles.actions}>
        <button
          className={styles.submit}
          disabled={!canSubmit}
          onClick={() => canSubmit && onSubmit(questionPaper!, answerSheet!)}
        >
          Process assessment
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
