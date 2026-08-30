"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useShell } from "./ShellContext";
import styles from "./AppShell.module.css";

interface AppShellProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { icon: GridIcon, label: "Home", href: "/" },
  { icon: ClassroomIcon, label: "My Classroom", href: "/classroom" },
  { icon: AssignmentIcon, label: "Assignments", href: "/assignments" },
  { icon: ExamIcon, label: "Exams", href: "/exams" },
  { icon: LibraryIcon, label: "My Library", href: "/library" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { collapsed, mobileMinimal, breadcrumb } = useShell();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(collapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(collapsed);
  }, [collapsed]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const breadcrumbIcon = NAV_ITEMS.find((item) => isActive(pathname, item.href))?.icon ?? ExamIcon;
  const BreadcrumbIcon = breadcrumbIcon;

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ""}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.logoRow}>
            <Link href="/" className={styles.logoLink}>
              <LogoIcon size={sidebarCollapsed ? 36 : 32} />
            </Link>
            {!sidebarCollapsed && (
              <>
                <Link href="/" className={styles.logoText}>
                  VedaAI
                </Link>
                <button
                  className={styles.collapseBtn}
                  onClick={() => setSidebarCollapsed(true)}
                  aria-label="Collapse sidebar"
                >
                  <CollapseIcon />
                </button>
              </>
            )}
          </div>

          {!sidebarCollapsed && (
            <button className={styles.toolkitBtn} type="button">
              <SparkleIcon size={14} />
              AI Teacher&apos;s Toolkit
            </button>
          )}

          {sidebarCollapsed && (
            <button className={styles.toolkitBtnCollapsed} type="button" aria-label="AI Teacher's Toolkit">
              <SparkleIcon size={16} />
            </button>
          )}

          <nav className={styles.nav}>
            {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                  title={sidebarCollapsed ? label : undefined}
                >
                  <Icon />
                  {!sidebarCollapsed && <span>{label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          {!sidebarCollapsed ? (
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
          {sidebarCollapsed && (
            <button
              className={styles.expandBtn}
              onClick={() => setSidebarCollapsed(false)}
              aria-label="Expand sidebar"
              type="button"
            >
              <ExpandIcon />
            </button>
          )}
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)}>
          <nav className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
            {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.mobileNavItem} ${active ? styles.mobileNavItemActive : ""}`}
                >
                  <Icon />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {mobileMinimal ? (
              <div className={styles.mobileBrand}>
                <LogoIcon size={28} />
                <span>VedaAI</span>
              </div>
            ) : (
              <>
                <button className={styles.iconBtn} type="button" aria-label="Go back" onClick={() => history.back()}>
                  <BackIcon />
                </button>
                <div className={styles.breadcrumb}>
                  <BreadcrumbIcon />
                  <span>{breadcrumb}</span>
                </div>
              </>
            )}
          </div>

          <div className={styles.headerRight}>
            {!mobileMinimal && (
              <>
                <button className={styles.iconBtn} type="button" aria-label="Help">
                  <HelpIcon />
                </button>
                <button className={`${styles.iconBtn} ${styles.bellBtn}`} type="button" aria-label="Notifications">
                  <BellIcon />
                  <span className={styles.notifDot} />
                </button>
                <button className={styles.iconBtn} type="button" aria-label="AI features">
                  <SparkleIcon size={18} />
                </button>
              </>
            )}
            {mobileMinimal && (
              <button className={`${styles.iconBtn} ${styles.bellBtn}`} type="button" aria-label="Notifications">
                <BellIcon />
                <span className={styles.notifDot} />
              </button>
            )}
            <button className={styles.profile} type="button" aria-label="Profile menu">
              <div className={styles.avatar} />
              {!mobileMinimal && (
                <>
                  <span className={styles.profileName}>Madhur Rastogi</span>
                  <ChevronSmall />
                </>
              )}
            </button>
            <button
              className={`${styles.iconBtn} ${styles.menuBtn}`}
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Menu"
              type="button"
            >
              <MenuIcon />
            </button>
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
