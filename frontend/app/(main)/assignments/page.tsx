"use client";

import { useShellConfig } from "@/components/ShellContext";
import styles from "../placeholder.module.css";

export default function AssignmentsPage() {
  useShellConfig({ collapsed: false, mobileMinimal: false, breadcrumb: "Assignments" });

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Assignments</h1>
      <p className={styles.subtitle}>Create and manage assignments for your students.</p>
      <div className={styles.placeholder}>Coming soon</div>
    </div>
  );
}
