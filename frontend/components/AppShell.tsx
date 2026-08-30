"use client";

import { ReactNode, useEffect, useState } from "react";
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
  activeSection?: string;
}

const NAV_ITEMS = [
  { icon: GridIcon, label: "Home" },
  { icon: ClassroomIcon, label: "My Classroom" },
  { icon: AssignmentIcon, label: "Assignments" },
  { icon: ExamIcon, label: "Exams" },
  { icon: LibraryIcon, label: "My Library" },
];

const NOTIFICATIONS = [
  {
    id: "1",
    title: "Exam graded",
    message: "Class 10 Maths unit test results are ready to review.",
    time: "2h ago",
  },
  {
    id: "2",
    title: "New submission",
    message: "A student uploaded an answer sheet for Science mid-term.",
    time: "5h ago",
  },
  {
    id: "3",
    title: "Reminder",
    message: "3 answer sheets are pending mapping.",
    time: "1d ago",
  },
];

export default function AppShell({
  children,
  collapsed: initialCollapsed = false,
  showBreadcrumb = true,
  mobileMinimal = false,
  activeSection = "Exams",
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState(activeSection);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    setCollapsed(initialCollapsed);
  }, [initialCollapsed]);

  const activeItem = NAV_ITEMS.find((item) => item.label === activeNav) ?? NAV_ITEMS[3];
  const ActiveIcon = activeItem.icon;

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
            <button className={styles.toolkitBtn} type="button">
              <SparkleIcon size={14} />
              AI Teacher&apos;s Toolkit
            </button>
          )}

          {collapsed && (
            <button className={styles.toolkitBtnCollapsed} type="button" aria-label="AI Teacher's Toolkit">
              <SparkleIcon size={16} />
            </button>
          )}

          <nav className={styles.nav}>
            {NAV_ITEMS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                className={`${styles.navItem} ${activeNav === label ? styles.navItemActive : ""}`}
                title={collapsed ? label : undefined}
                onClick={() => setActiveNav(label)}
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
                <button className={styles.iconBtn} type="button" aria-label="Go back">
                  <BackIcon />
                </button>
                <div className={styles.breadcrumb}>
                  <ActiveIcon />
                  <span>{activeNav}</span>
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
                <button className={styles.iconBtn} type="button" aria-label="Help">
                  <HelpIcon />
                </button>
                <div
                  className={styles.notifWrap}
                  onMouseEnter={() => setNotifOpen(true)}
                  onMouseLeave={() => setNotifOpen(false)}
                >
                  <button
                    className={`${styles.iconBtn} ${styles.bellBtn}`}
                    type="button"
                    aria-label="Notifications"
                    onClick={() => setNotifOpen((open) => !open)}
                  >
                    <BellIcon />
                    <span className={styles.notifDot} />
                  </button>
                  {notifOpen && (
                    <div className={styles.notifPopover}>
                      <div className={styles.notifHeader}>Notifications</div>
                      <div className={styles.notifList}>
                        {NOTIFICATIONS.map((n) => (
                          <div key={n.id} className={styles.notifItem}>
                            <div className={styles.notifTitle}>{n.title}</div>
                            <div className={styles.notifMessage}>{n.message}</div>
                            <div className={styles.notifTime}>{n.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button className={styles.iconBtn} type="button" aria-label="AI features">
                  <SparkleIcon size={18} />
                </button>
              </>
            )}
            {mobileMinimal && (
              <div
                className={styles.notifWrap}
                onMouseEnter={() => setNotifOpen(true)}
                onMouseLeave={() => setNotifOpen(false)}
              >
                <button
                  className={`${styles.iconBtn} ${styles.bellBtn}`}
                  type="button"
                  aria-label="Notifications"
                  onClick={() => setNotifOpen((open) => !open)}
                >
                  <BellIcon />
                  <span className={styles.notifDot} />
                </button>
                {notifOpen && (
                  <div className={styles.notifPopover}>
                    <div className={styles.notifHeader}>Notifications</div>
                    <div className={styles.notifList}>
                      {NOTIFICATIONS.map((n) => (
                        <div key={n.id} className={styles.notifItem}>
                          <div className={styles.notifTitle}>{n.title}</div>
                          <div className={styles.notifMessage}>{n.message}</div>
                          <div className={styles.notifTime}>{n.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
