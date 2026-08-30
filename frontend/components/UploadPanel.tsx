"use client";

import { useRef, useState } from "react";
import { ArrowRightIcon, CloseIcon, PdfIcon, TeacherIllustration, UploadIcon } from "./icons";
import styles from "./UploadPanel.module.css";

const ACCEPTED = ".pdf,image/*";
const MAX_SIZE_MB = 10;

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
}

interface DropzoneProps {
  label: string;
  accent: string;
  file: File | null;
  onFile: (file: File | null) => void;
}

function Dropzone({ label, accent, file, onFile }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className={`${styles.dropzone} ${active ? styles.active : ""} ${file ? styles.filled : ""}`}
      onClick={() => !file && inputRef.current?.click()}
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
      {file ? (
        <div className={styles.fileCard}>
          <button className={styles.removeBtn} onClick={handleRemove} aria-label="Remove file">
            <CloseIcon />
          </button>
          <PdfIcon />
          <div className={styles.fileInfo}>
            <div className={styles.fileName}>{file.name}</div>
            <div className={styles.fileMeta}>{formatFileSize(file.size)}</div>
          </div>
        </div>
      ) : (
        <>
          <UploadIcon />
          <div className={styles.uploadLabel}>
            Upload <span className={styles.accent}>{accent}</span>
          </div>
          <div className={styles.maxSize}>Max {MAX_SIZE_MB}MB</div>
        </>
      )}
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
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Upload <span className={styles.highlight}>Question Paper &amp; Answer Sheets</span>
        </h1>
        <p className={styles.subtitle}>Upload both files to get started</p>
        <div className={styles.illustration}>
          <TeacherIllustration />
        </div>
      </div>

      <div className={styles.uploadArea}>
        <div className={styles.grid}>
          <Dropzone
            label="Question Paper"
            accent="Question Paper"
            file={questionPaper}
            onFile={setQuestionPaper}
          />
          <Dropzone
            label="Answer Sheet"
            accent="Answer Sheet"
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
            Start Mapping
            <ArrowRightIcon />
          </button>
          <p className={styles.hint}>
            Once both files are uploaded, you&apos;ll able to map answers with questions
          </p>
          {error && <div className={styles.error}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
