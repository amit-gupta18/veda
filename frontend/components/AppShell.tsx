"use client";

import { ReactNode, useState } from "react";
import {
  AssignmentIcon,
  BackIcon,
  BellIcon,
  ClassroomIcon,
  CollapseIcon,
  ExamIcon,
  ExpandIcon,
  GridIcon,
  HelpIcon,
  LibraryIcon,
  LogoIcon,
  MenuIcon,
  SparkleIcon,
} from "./icons";
import styles from "./AppShell.module.css";

interface AppShellProps {
  children: ReactNode;
  collapsed?: boolean;
  showBreadcrumb?: boolean;
  mobileMinimal?: boolean;
}

const NAV_ITEMS = [
  { icon: GridIcon, label: "Home", active: false },
  { icon: ClassroomIcon, label: "My Classroom", active: false },
  { icon: AssignmentIcon, label: "Assignments", active: false },
  { icon: ExamIcon, label: "Exams", active: true },
  { icon: LibraryIcon, label: "My Library", active: false },
];

export default function AppShell({
  children,
  collapsed: initialCollapsed = false,
  showBreadcrumb = true,
  mobileMinimal = false,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.logoRow}>
            <LogoIcon size={collapsed ? 36 : 32} />
            {!collapsed && <span className={styles.logoText}>VedaAI</span>}
            {!collapsed && (
              <button className={styles.collapseBtn} onClick={() => setCollapsed(true)} aria-label="Collapse sidebar">
                <CollapseIcon />
              </button>
            )}
          </div>

          {!collapsed && (
            <button className={styles.toolkitBtn}>
              <SparkleIcon size={14} />
              AI Teacher&apos;s Toolkit
            </button>
          )}

          {collapsed && (
            <button className={styles.toolkitBtnCollapsed} aria-label="AI Teacher's Toolkit">
              <SparkleIcon size={16} />
            </button>
          )}

          <nav className={styles.nav}>
            {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
              <button
                key={label}
                className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                title={collapsed ? label : undefined}
              >
                <Icon />
                {!collapsed && <span>{label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          {!collapsed ? (
            <div className={styles.schoolCard}>
              <div className={styles.schoolLogo}>DPS</div>
              <div>
                <div className={styles.schoolName}>Delhi Public School</div>
                <div className={styles.schoolCity}>Bokaro Steel City</div>
              </div>
            </div>
          ) : (
            <div className={styles.schoolLogoSmall}>DPS</div>
          )}
          {collapsed && (
            <button className={styles.expandBtn} onClick={() => setCollapsed(false)} aria-label="Expand sidebar">
              <ExpandIcon />
            </button>
          )}
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {showBreadcrumb ? (
              <>
                <button className={styles.iconBtn} aria-label="Go back">
                  <BackIcon />
                </button>
                <div className={styles.breadcrumb}>
                  <ExamIcon />
                  <span>Exams</span>
                </div>
              </>
            ) : (
              <div className={styles.mobileBrand}>
                <LogoIcon size={28} />
                <span>VedaAI</span>
              </div>
            )}
          </div>

          <div className={styles.headerRight}>
            {!mobileMinimal && (
              <>
                <button className={styles.iconBtn} aria-label="Help">
                  <HelpIcon />
                </button>
                <button className={`${styles.iconBtn} ${styles.bellBtn}`} aria-label="Notifications">
                  <BellIcon />
                  <span className={styles.notifDot} />
                </button>
                <button className={styles.iconBtn} aria-label="AI features">
                  <SparkleIcon size={18} />
                </button>
              </>
            )}
            {mobileMinimal && (
              <button className={`${styles.iconBtn} ${styles.bellBtn}`} aria-label="Notifications">
                <BellIcon />
                <span className={styles.notifDot} />
              </button>
            )}
            <div className={styles.profile}>
              <div className={styles.avatar} />
              {!mobileMinimal && (
                <>
                  <span className={styles.profileName}>Madhur Rastogi</span>
                  <ChevronSmall />
                </>
              )}
            </div>
            {mobileMinimal && (
              <button className={styles.iconBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
                <MenuIcon />
              </button>
            )}
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

function ChevronSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
