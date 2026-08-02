"use client";

import { useEffect, useState } from "react";
import type { PulseEvent, PulseMetrics } from "@/lib/types";
import { buildStatCards } from "@/lib/stats";

type PulsePayload = {
  events: PulseEvent[];
  metrics: PulseMetrics;
  live: boolean;
};

const FALLBACK_TICKER = [
  "⚡ Solange pushed to Pulse (2m ago)",
  "⚡ Mitchelldante99 deployed Forth (14m ago)",
  "⚡ Nik Jain merged PR on Rally (22m ago)",
  "⚡ Rawle Arneaud shipped Lighthouse (41m ago)",
  "⚡ Cohort velocity: 98%",
  "⚡ Raven-dubgub pushed to Comms (1h ago)",
];

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
    const id = setInterval(load, 25_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const velocity = data?.metrics?.cohortVelocity ?? 98;
  const events = data?.events ?? [];
  const lines =
    events.length > 0
      ? [
          ...events.map((e) => e.message),
          `⚡ Cohort velocity: ${velocity}%`,
        ]
      : FALLBACK_TICKER;
  const doubled = [...lines, ...lines];

  return (
    <div className="neon-pulse-bar relative z-50" aria-live="polite">
      <div className="neon-pulse-glow" />
      <div className="relative flex items-center gap-3 px-3 py-1.5 sm:px-4">
        <span className="neon-live-badge shrink-0">
          <span className="neon-dot" />
          LIVE
        </span>
      </div>
      <div className="relative overflow-hidden py-1.5">
        <div className="ticker-track neon-ticker gap-10 px-4 font-mono text-[11px] font-medium uppercase tracking-wide sm:text-xs">
          {doubled.map((line, i) => (
            <span key={`${line}-${i}`} className="inline-flex shrink-0 items-center">
              {line}
              <span className="mx-5 text-[var(--accent)] opacity-60">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatsDashboard({
  initialMetrics,
}: {
  initialMetrics: PulseMetrics;
}) {
  const [metrics, setMetrics] = useState(initialMetrics);

  useEffect(() => {
    fetch("/api/pulse")
      .then((r) => r.json())
      .then((d: PulsePayload) => {
        if (d.metrics) setMetrics(d.metrics);
      })
      .catch(() => {});
  }, []);

  const cards = buildStatCards(metrics);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={card.id}
          className={`stat-card stat-accent-${card.accent}`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="stat-card-shine" />
          <p className="stat-label">{card.label}</p>
          <p className="stat-value">{card.value.toLocaleString()}</p>
          <p
            className={`stat-delta ${card.deltaPositive ? "stat-delta-up" : ""}`}
          >
            {card.delta}
          </p>
        </div>
      ))}
    </div>
  );
}
