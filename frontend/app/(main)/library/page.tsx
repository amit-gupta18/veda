"use client";

import { useShellConfig } from "@/components/ShellContext";
import styles from "../placeholder.module.css";

export default function LibraryPage() {
  useShellConfig({ collapsed: false, mobileMinimal: false, breadcrumb: "My Library" });

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>My Library</h1>
      <p className={styles.subtitle}>Saved papers, rubrics, and teaching resources.</p>
      <div className={styles.placeholder}>Coming soon</div>
    </div>
  );
}
