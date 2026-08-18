"use client";

import { useState } from "react";

const STEPS = [
  {
    n: "01",
    title: "Browse evidence",
    body: "Open profiles, repos, and live deploys — judge the trail, not a résumé.",
  },
  {
    n: "02",
    title: "Request intros",
    body: "Pick students on Trailmark. Placement confirms opt-in within 24 hours.",
  },
  {
    n: "03",
    title: "Interview your way",
    body: "Run your own bar. We route intros; we don’t replace your process.",
  },
  {
    n: "04",
    title: "Hire & settle",
    body: "Fee invoices on start date. 90-day clawback. 10% kickback to the graduate.",
  },
];

export function HiringSteps() {
  const [active, setActive] = useState(0);

  return (
    <div className="hiring-steps">
      <div className="hiring-steps-rail" role="tablist" aria-label="Hiring steps">
        {STEPS.map((step, i) => (
          <button
            key={step.n}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={`hiring-step-tab ${active === i ? "is-active" : ""}`}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
          >
            <span className="font-mono text-xs text-[var(--signal)]">{step.n}</span>
            <span className="font-display text-lg leading-tight">{step.title}</span>
          </button>
        ))}
      </div>
      <div className="hiring-step-panel" role="tabpanel">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--signal)]">
          Step {STEPS[active].n}
        </p>
        <p className="mt-3 font-display text-2xl tracking-tight">
          {STEPS[active].title}
        </p>
        <p className="mt-3 text-[var(--fog)] leading-relaxed">{STEPS[active].body}</p>
        <div className="mt-5 flex gap-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`step-dot ${active === i ? "is-active" : ""}`}
              aria-label={`Show step ${i + 1}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
