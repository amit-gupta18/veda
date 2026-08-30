"use client";

import { ReactNode } from "react";
import AppShell from "@/components/AppShell";
import { ShellProvider } from "@/components/ShellContext";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ShellProvider>
      <AppShell>{children}</AppShell>
    </ShellProvider>
  );
}
