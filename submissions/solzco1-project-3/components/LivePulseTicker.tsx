"use client";

import { useEffect, useState } from "react";
import type { PulseEvent, PulseMetrics } from "@/lib/types";

type PulsePayload = {
  events: PulseEvent[];
  metrics: PulseMetrics;
  live: boolean;
};

export function LivePulseTicker() {
  const [data, setData] = useState<PulsePayload | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/pulse");
        if (!res.ok) return;
        const json = (await res.json()) as PulsePayload;
        if (active) setData(json);
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const events = data?.events ?? [];
  const doubled = [...events, ...events];

  return (
    <div
      className="relative z-50 overflow-hidden border-b border-[var(--glass-border)] bg-[var(--bg)] py-2 font-mono text-xs"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 px-4">
        <span className="flex shrink-0 items-center gap-1.5 text-[var(--accent-2)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-2)]" />
          LIVE PULSE
        </span>
        {data?.metrics && (
          <span className="hidden shrink-0 text-[var(--ink-muted)] sm:inline">
            ships {data.metrics.totalShips} · commits {data.metrics.combinedCommits}{" "}
            · active {data.metrics.activeProjects}
          </span>
        )}
      </div>
      <div className="relative mt-1 overflow-hidden">
        <div className="ticker-track gap-8 px-4 text-[var(--ink-muted)]">
          {doubled.map((ev, i) => (
            <span key={`${ev.id}-${i}`} className="inline-flex shrink-0 items-center gap-2 pr-8">
              <span className="text-[var(--accent)]">{ev.when}</span>
              {ev.message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
