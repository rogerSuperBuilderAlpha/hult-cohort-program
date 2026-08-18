"use client";

import { useState } from "react";

const TERMS = [
  {
    key: "Fee",
    short: "25%",
    detail: "of first-year base salary, invoiced when employment starts.",
  },
  {
    key: "Clawback",
    short: "90d",
    detail: "Full refund if employment ends for cause (or quit) within 90 days.",
  },
  {
    key: "Exclusivity",
    short: "None",
    detail: "Partners share the cohort. Students may receive multiple offers.",
  },
  {
    key: "Kickback",
    short: "10%",
    detail: "of collected fee returned to the hired graduate within 30 days.",
  },
];

export function TermCards() {
  const [flipped, setFlipped] = useState<string | null>(null);

  return (
    <div className="term-grid">
      {TERMS.map((term) => {
        const open = flipped === term.key;
        return (
          <button
            key={term.key}
            type="button"
            className={`term-card ${open ? "is-flipped" : ""}`}
            onClick={() => setFlipped(open ? null : term.key)}
            aria-pressed={open}
          >
            <span className="term-card-front">
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--signal)]">
                {term.key}
              </span>
              <span className="mt-3 font-display text-4xl tracking-tight">
                {term.short}
              </span>
              <span className="term-hint">Tap for detail</span>
            </span>
            <span className="term-card-back">
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--signal)]">
                {term.key}
              </span>
              <span className="mt-3 text-sm leading-relaxed text-[var(--fog)]">
                {term.detail}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
