"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSidebarData as useSidebarDataInternal } from "@/hooks/useSidebarData";

type SidebarDataValue = ReturnType<typeof useSidebarDataInternal>;

const SidebarDataContext = createContext<SidebarDataValue | null>(null);

export function SidebarDataProvider({ children }: { children: ReactNode }) {
  const value = useSidebarDataInternal();
  return <SidebarDataContext.Provider value={value}>{children}</SidebarDataContext.Provider>;
}

export function useSidebarData(): SidebarDataValue {
  const value = useContext(SidebarDataContext);
  if (!value) {
    throw new Error("useSidebarData must be used within SidebarDataProvider");
  }
  return value;
}
