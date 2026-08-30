export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#1a1a1a" />
      <path
        d="M9 10h5.5c3.3 0 5.5 1.8 5.5 4.8 0 2.2-1.2 3.8-3.2 4.5L21 22H16l-2.8-5.5H13V22H9V10zm4 3.5v3h1.2c1.1 0 1.8-.6 1.8-1.5s-.7-1.5-1.8-1.5H13z"
        fill="white"
      />
    </svg>
  );
}

export function SparkleIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0l1.2 4.8L14 6l-4.8 1.2L8 12l-1.2-4.8L2 6l4.8-1.2L8 0z" />
    </svg>
  );
}

export function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="16" height="16" rx="4" fill="#f5f5f5" stroke="#e5e5e5" />
      <path d="M10 13V7M7 9.5L10 6.5l3 3" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PdfIcon() {
  return (
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
      <rect width="32" height="40" rx="4" fill="#ef4444" />
      <text x="16" y="24" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif">
        PDF
      </text>
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 1l10 10M11 1L1 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 4.5L7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ClassroomIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 15v2M13 15v2M2 8h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function AssignmentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 3h7l4 4v10a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3v4h4M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ExamIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 6h6M7 9.5h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function LibraryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function HelpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 8a2 2 0 114 0c0 1.5-2 1.5-2 3M10 14.5h.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 3a5 5 0 00-5 5v3l-1.5 2.5h13L15 11V8a5 5 0 00-5-5zM8.5 16a1.5 1.5 0 003 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CollapseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TeacherIllustration() {
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      <circle cx="80" cy="80" r="72" fill="url(#teacherGrad)" />
      <circle cx="30" cy="50" r="8" fill="#ff6b35" opacity="0.6" />
      <circle cx="130" cy="60" r="6" fill="#ff6b35" opacity="0.5" />
      <circle cx="120" cy="120" r="7" fill="#ff6b35" opacity="0.4" />
      <circle cx="40" cy="110" r="5" fill="#ff6b35" opacity="0.5" />
      <ellipse cx="80" cy="130" rx="35" ry="8" fill="#e0e0e0" />
      <rect x="55" y="85" width="50" height="45" rx="8" fill="#2d2d2d" />
      <rect x="60" y="90" width="40" height="30" rx="4" fill="#4a4a4a" />
      <circle cx="80" cy="55" r="22" fill="#f5c6a0" />
      <ellipse cx="80" cy="48" rx="24" ry="20" fill="#3d2314" />
      <circle cx="73" cy="52" r="2.5" fill="#1a1a1a" />
      <circle cx="87" cy="52" r="2.5" fill="#1a1a1a" />
      <path d="M76 58 Q80 62 84 58" stroke="#c4845c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <rect x="62" y="72" width="36" height="18" rx="4" fill="#ff6b35" />
      <defs>
        <radialGradient id="teacherGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe8de" />
          <stop offset="100%" stopColor="#ffd4c4" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function ExtractingSparkles() {
  return (
    <div style={{ position: "relative", width: 80, height: 60, margin: "0 auto" }}>
      <svg width="80" height="60" viewBox="0 0 80 60" fill="none" style={{ position: "absolute", inset: 0 }}>
        <path d="M40 5l3 12 12 3-12 3-3 12-3-12-12-3 12-3 3-12z" fill="url(#sparkleGrad)" />
        <path d="M65 35l2 8 8 2-8 2-2 8-2-8-8-2 8-2 2-8z" fill="url(#sparkleGrad)" opacity="0.7" />
        <path d="M15 40l1.5 6 6 1.5-6 1.5-1.5 6-1.5-6-6-1.5 6-1.5 1.5-6z" fill="url(#sparkleGrad)" opacity="0.5" />
        <circle cx="55" cy="15" r="3" fill="#ff6b35" opacity="0.6" />
        <defs>
          <linearGradient id="sparkleGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff8a00" />
            <stop offset="100%" stopColor="#ff4d00" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
