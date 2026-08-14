"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { LiveMetrics } from "@/lib/metrics";
import {
  getLiveCountersRaw,
  getServerLiveCountersRaw,
  parseLiveCountersRaw,
  subscribeLiveCounters,
} from "@/lib/live-counters";

type Props = {
  metrics: LiveMetrics;
};

export function LiveSummary({ metrics }: Props) {
  const countersRaw = useSyncExternalStore(
    subscribeLiveCounters,
    getLiveCountersRaw,
    getServerLiveCountersRaw
  );
  const counters = parseLiveCountersRaw(countersRaw);
  const [tick, setTick] = useState(metrics.updatedAt);

  useEffect(() => {
    const id = window.setInterval(
      () => setTick(new Date().toISOString()),
      30_000
    );
    return () => window.clearInterval(id);
  }, []);

  const sessionItems = [
    {
      id: "intro-requests",
      label: "Intro requests (browser)",
      value: counters.introRequests,
      href: "/partners",
    },
    {
      id: "rsvps",
      label: "RSVPs (browser)",
      value: counters.rsvps,
      href: "/rsvp",
    },
  ];

  const items = [...metrics.items, ...sessionItems];
  const syncedLabel = new Date(tick).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <>
      {/* Desktop — vertical left rail, no scroll; list ends above Next.js “N” */}
      <aside
        aria-label="Cohort Live"
        className="fixed inset-y-0 left-0 z-40 hidden w-[10.5rem] flex-col overflow-hidden border-r border-[var(--line)] bg-[var(--bg-elevated)]/95 backdrop-blur-md lg:flex"
      >
        <div className="shrink-0 border-b border-[var(--line)] px-3 py-3">
          <div className="flex items-center gap-2">
            <span
              className="signal-bar inline-block h-2 w-2 bg-[var(--ok)]"
              aria-hidden
            />
            <p className="font-[family-name:var(--font-jetbrains)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--signal)]">
              Cohort Live
            </p>
          </div>
          <p className="mt-1.5 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
            Demo counters · {syncedLabel}
          </p>
        </div>

        <ul className="flex min-h-0 flex-1 flex-col overflow-hidden pb-14">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex min-h-0 flex-1 border-b border-[var(--line)]/70 last:border-b-0"
            >
              <MetricRow item={item} />
            </li>
          ))}
        </ul>
      </aside>

      {/* Mobile — horizontal strip along the bottom */}
      <aside
        aria-label="Cohort Live"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--bg-elevated)]/95 backdrop-blur-md lg:hidden"
      >
        <div className="flex items-center gap-3 overflow-x-auto px-4 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))]">
          <div className="flex shrink-0 items-center gap-1.5 pr-2">
            <span
              className="signal-bar inline-block h-1.5 w-1.5 bg-[var(--ok)]"
              aria-hidden
            />
            <span className="font-[family-name:var(--font-jetbrains)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--signal)]">
              Demo
            </span>
          </div>
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href ?? "#"}
              className="flex shrink-0 items-baseline gap-1.5 border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1.5"
            >
              <span className="font-[family-name:var(--font-syne)] text-sm font-bold text-[var(--ink)]">
                {item.value}
              </span>
              <span className="font-[family-name:var(--font-jetbrains)] text-[9px] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}

function MetricRow({
  item,
}: {
  item: { id: string; label: string; value: number; href?: string };
}) {
  const className =
    "flex h-full min-h-0 w-full flex-col justify-center px-3 py-1.5 transition hover:bg-[var(--surface-hover)] hover:text-[var(--signal)]";

  const inner = (
    <>
      <p className="font-[family-name:var(--font-syne)] text-xl font-bold leading-none tracking-tight text-[var(--ink)]">
        {item.value}
      </p>
      <p className="mt-1 font-[family-name:var(--font-jetbrains)] text-[9px] uppercase leading-snug tracking-[0.11em] text-[var(--ink-muted)]">
        {item.label}
      </p>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
