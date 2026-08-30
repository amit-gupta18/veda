"use client";

import { useShellConfig } from "@/components/ShellContext";
import styles from "../placeholder.module.css";

export default function ClassroomPage() {
  useShellConfig({ collapsed: false, mobileMinimal: false, breadcrumb: "My Classroom" });

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>My Classroom</h1>
      <p className={styles.subtitle}>Your classes and students will appear here.</p>
      <div className={styles.placeholder}>Coming soon</div>
    </div>
  );
}
