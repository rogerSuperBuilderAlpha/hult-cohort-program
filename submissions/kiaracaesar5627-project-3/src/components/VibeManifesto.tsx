"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const BEATS = [
  {
    label: "Ship",
    line: "One-week contests. Production HTTPS. Real users inside the cohort.",
  },
  {
    label: "Review",
    line: "Written GitHub reviews first — then private votes. Heat with receipts.",
  },
  {
    label: "Prove",
    line: "Repos, deploys, and operator trails partners can open tonight.",
  },
  {
    label: "Hire",
    line: "Request an intro. Placement confirms opt-in. You run your bar.",
  },
];

export function VibeManifesto() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setActive((i) => (i + 1) % BEATS.length);
    }, 3200);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section className="vibe-manifesto section">
      <p className="section-kicker">How Trailmark works</p>
      <h2 className="vibe-manifesto-title">
        Credibility
        <br />
        <span className="vibe-accent">you can click.</span>
      </h2>
      <p className="section-lead vibe-manifesto-lead">
        Four beats. No theater. Follow the same loop partners use when they
        shortlist from this surface.
      </p>

      <div className="vibe-beat-rail" role="tablist" aria-label="Trailmark beats">
        {BEATS.map((beat, i) => (
          <button
            key={beat.label}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={`vibe-beat ${active === i ? "is-active" : ""}`}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
          >
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--signal)]">
              0{i + 1}
            </span>
            <span className="font-display text-xl tracking-tight">{beat.label}</span>
          </button>
        ))}
      </div>
      <p className="vibe-beat-line" role="tabpanel">
        {BEATS[active].line}
      </p>

      <div className="vibe-manifesto-cta">
        <Link href="/partners/intro" className="btn btn-primary">
          Request an intro
        </Link>
        <Link href="/rsvp" className="btn btn-ghost">
          RSVP · Aug 19
        </Link>
      </div>
    </section>
  );
}
