"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BBox, PageImage } from "@/lib/types";
import styles from "./AnswerViewer.module.css";

interface AnswerViewerProps {
  pages: PageImage[];
  activeRegions: BBox[]; // regions to highlight strongly (the selected answer)
  allRegions: BBox[]; // every known answer region, shown dimmed for context
}

export default function AnswerViewer({ pages, activeRegions, allRegions }: AnswerViewerProps) {
  const sortedPages = useMemo(() => [...pages].sort((a, b) => a.page - b.page), [pages]);
  const [pageIndex, setPageIndex] = useState(0);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Jump to the first page containing an active region whenever the selection changes.
  useEffect(() => {
    if (activeRegions.length === 0) return;
    const targetPage = activeRegions[0].page;
    const idx = sortedPages.findIndex((p) => p.page === targetPage);
    if (idx >= 0) {
      setPageIndex(idx);
      requestAnimationFrame(() => {
        pageRefs.current[targetPage]?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRegions, sortedPages]);

  if (sortedPages.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty}>No answer sheet pages to display.</div>
      </div>
    );
  }

  const current = sortedPages[pageIndex];
  const activeSet = new Set(activeRegions.map((r) => `${r.page}:${r.x}:${r.y}:${r.w}:${r.h}`));

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.pager}>
          <button
            className={styles.pagerBtn}
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
          >
            ‹
          </button>
          <span className={styles.pageLabel}>
            Page {current.page} of {sortedPages.length}
          </span>
          <button
            className={styles.pagerBtn}
            disabled={pageIndex === sortedPages.length - 1}
            onClick={() => setPageIndex((i) => Math.min(sortedPages.length - 1, i + 1))}
          >
            ›
          </button>
        </div>
      </div>

      <div className={styles.scrollArea}>
        <div
          className={styles.pageWrap}
          ref={(el) => {
            pageRefs.current[current.page] = el;
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.pageImg} src={current.dataUrl} alt={`Answer sheet page ${current.page}`} />
          {allRegions
            .filter((r) => r.page === current.page)
            .map((r, idx) => {
              const key = `${r.page}:${r.x}:${r.y}:${r.w}:${r.h}`;
              const isActive = activeSet.has(key);
              return (
                <div
                  key={idx}
                  className={`${styles.box} ${isActive ? styles.active : styles.dim}`}
                  style={{
                    left: `${r.x * 100}%`,
                    top: `${r.y * 100}%`,
                    width: `${r.w * 100}%`,
                    height: `${r.h * 100}%`,
                  }}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
