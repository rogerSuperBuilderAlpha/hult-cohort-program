"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { VibeId } from "@/lib/types";
import { nextVibe, VIBES } from "@/lib/vibes";
import { CursorGlow } from "./CursorGlow";
import { LivePulseTicker } from "./LivePulseTicker";
import { PulseHeader } from "./PulseHeader";
import { PulseFooter } from "./PulseFooter";

type VibeContextValue = {
  vibe: VibeId;
  cycleVibe: () => void;
  vibeLabel: string;
};

const VibeContext = createContext<VibeContextValue | null>(null);

export function useVibe() {
  const ctx = useContext(VibeContext);
  if (!ctx) throw new Error("useVibe must be used within PulseShell");
  return ctx;
}

export function PulseShell({ children }: { children: ReactNode }) {
  const [vibe, setVibe] = useState<VibeId>("cyberpunk");

  useEffect(() => {
    const saved = localStorage.getItem("pulse-vibe") as VibeId | null;
    if (saved && VIBES.some((v) => v.id === saved)) {
      setVibe(saved);
      document.documentElement.setAttribute("data-vibe", saved);
    }
  }, []);

  const cycleVibe = useCallback(() => {
    setVibe((current) => {
      const n = nextVibe(current);
      document.documentElement.setAttribute("data-vibe", n);
      localStorage.setItem("pulse-vibe", n);
      return n;
    });
  }, []);

  const vibeLabel =
    VIBES.find((v) => v.id === vibe)?.label ?? "Cyberpunk Neon";

  return (
    <VibeContext.Provider value={{ vibe, cycleVibe, vibeLabel }}>
      <CursorGlow />
      <div className="relative flex min-h-screen flex-col">
        <LivePulseTicker />
        <PulseHeader />
        <main className="relative z-10 flex-1">{children}</main>
        <PulseFooter />
      </div>
    </VibeContext.Provider>
  );
}
