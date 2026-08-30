"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BBox, PageImage } from "@/lib/types";
import styles from "./AnswerViewer.module.css";

interface AnswerViewerProps {
  pages: PageImage[];
  activeRegions: BBox[];
  allRegions: BBox[];
  questionLabel?: string | null;
}

export default function AnswerViewer({ pages, activeRegions, allRegions, questionLabel }: AnswerViewerProps) {
  const sortedPages = useMemo(() => [...pages].sort((a, b) => a.page - b.page), [pages]);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

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
        <div className={styles.toolbar}>
          <span className={styles.toolbarTitle}>Answer Sheet</span>
        </div>
        <div className={styles.empty}>No answer sheet pages to display.</div>
      </div>
    );
  }

  const current = sortedPages[pageIndex];
  const activeSet = new Set(activeRegions.map((r) => `${r.page}:${r.x}:${r.y}:${r.w}:${r.h}`));

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <span className={styles.toolbarTitle}>Answer Sheet</span>
        <div className={styles.toolbarControls}>
          <div className={styles.zoomControls}>
            <button
              className={styles.toolBtn}
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              aria-label="Zoom out"
            >
              −
            </button>
            <span className={styles.zoomLabel}>{zoom}%</span>
            <button
              className={styles.toolBtn}
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
          <div className={styles.pager}>
            <button
              className={styles.toolBtn}
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>
            <span className={styles.pageLabel}>
              Page {current.page} of {sortedPages.length}
            </span>
            <button
              className={styles.toolBtn}
              disabled={pageIndex === sortedPages.length - 1}
              onClick={() => setPageIndex((i) => Math.min(sortedPages.length - 1, i + 1))}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className={styles.scrollArea}>
        <div
          className={styles.pageWrap}
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
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
                >
                  {isActive && questionLabel && <span className={styles.boxLabel}>Q{questionLabel}</span>}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
