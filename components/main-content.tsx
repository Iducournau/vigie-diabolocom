"use client";

import { ReactNode } from "react";
import { useSidebar } from "@/components/sidebar-context";

export function MainContent({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={`min-h-screen transition-all duration-300 ${
        collapsed ? "pl-16" : "pl-56"
      }`}
    >
      <div className="p-6">{children}</div>
    </main>
  );
}
