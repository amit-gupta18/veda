"use client";

import styles from "./ProgressView.module.css";

export type StageStatus = "pending" | "active" | "done" | "error";

export interface Stage {
  key: string;
  label: string;
  status: StageStatus;
}

export default function ProgressView({ stages }: { stages: Stage[] }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h2 className={styles.title}>Processing assessment&hellip;</h2>
        <div className={styles.steps}>
          {stages.map((stage) => (
            <div className={styles.step} key={stage.key}>
              <div className={`${styles.dot} ${styles[stage.status]}`}>
                {stage.status === "done" && "✓"}
                {stage.status === "error" && "!"}
                {stage.status === "active" && <span className={styles.spinner} />}
              </div>
              <span
                className={`${styles.stepLabel} ${stage.status === "active" ? styles.active : ""} ${
                  stage.status === "done" ? styles.done : ""
                }`}
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
