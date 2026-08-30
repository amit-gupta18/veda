"use client";

import { ExtractingSparkles } from "./icons";
import styles from "./ProgressView.module.css";

export type StageStatus = "pending" | "active" | "done" | "error";

export interface Stage {
  key: string;
  label: string;
  status: StageStatus;
}

export default function ProgressView({ stages: _stages }: { stages: Stage[] }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <ExtractingSparkles />
        <h2 className={styles.title}>Extracting...</h2>
        <p className={styles.subtitle}>This may take a while</p>
      </div>
    </div>
  );
}
