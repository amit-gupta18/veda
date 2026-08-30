"use client";

import Link from "next/link";
import { ExamIcon, GridIcon, SparkleIcon } from "@/components/icons";
import { useShellConfig } from "@/components/ShellContext";
import styles from "./home.module.css";

const QUICK_LINKS = [
  {
    href: "/exams",
    title: "Grade Exams",
    description: "Upload question papers and answer sheets to map and grade student responses.",
    icon: ExamIcon,
    accent: true,
  },
  {
    href: "/classroom",
    title: "My Classroom",
    description: "View your classes, students, and recent activity.",
    icon: GridIcon,
    accent: false,
  },
  {
    href: "/assignments",
    title: "Assignments",
    description: "Create and review assignments across your subjects.",
    icon: ExamIcon,
    accent: false,
  },
  {
    href: "/library",
    title: "My Library",
    description: "Access saved papers, rubrics, and teaching resources.",
    icon: GridIcon,
    accent: false,
  },
];

export default function HomePage() {
  useShellConfig({ collapsed: false, mobileMinimal: false, breadcrumb: "Home" });

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <button className={styles.toolkitBanner} type="button">
          <SparkleIcon size={16} />
          AI Teacher&apos;s Toolkit is ready
        </button>
        <h1 className={styles.title}>Welcome back, Madhur</h1>
        <p className={styles.subtitle}>Pick up where you left off or start grading a new exam.</p>
      </section>

      <section className={styles.grid}>
        {QUICK_LINKS.map(({ href, title, description, icon: Icon, accent }) => (
          <Link key={href} href={href} className={`${styles.card} ${accent ? styles.cardAccent : ""}`}>
            <div className={styles.cardIcon}>
              <Icon />
            </div>
            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>{title}</h2>
              <p className={styles.cardDesc}>{description}</p>
            </div>
            <span className={styles.cardArrow}>→</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
