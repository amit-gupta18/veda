"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

interface ShellState {
  collapsed: boolean;
  mobileMinimal: boolean;
  breadcrumb: string;
}

interface ShellContextValue extends ShellState {
  setShell: (patch: Partial<ShellState>) => void;
}

const defaultState: ShellState = {
  collapsed: false,
  mobileMinimal: false,
  breadcrumb: "Home",
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShellState>(defaultState);

  const value = useMemo(
    () => ({
      ...state,
      setShell: (patch: Partial<ShellState>) => setState((prev) => ({ ...prev, ...patch })),
    }),
    [state]
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within ShellProvider");
  return ctx;
}

export function useShellConfig(patch: Partial<ShellState>) {
  const { setShell } = useShell();

  useEffect(() => {
    setShell(patch);
    return () => setShell(defaultState);
  }, [setShell, patch.collapsed, patch.mobileMinimal, patch.breadcrumb]);
}
