"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  const [pings, setPings] = useState(0);
  const [spark, setSpark] = useState(false);

  useEffect(() => {
    if (!spark) return;
    const t = window.setTimeout(() => setSpark(false), 700);
    return () => window.clearTimeout(t);
  }, [spark]);

  return (
    <footer className="site-footer border-t border-[var(--line)]">
      <div className="section !py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <button
              type="button"
              className={`footer-brand font-display text-2xl tracking-tight ${spark ? "is-spark" : ""}`}
              onClick={() => {
                setPings((n) => n + 1);
                setSpark(true);
              }}
              aria-label={`Ping ${SITE.name}`}
            >
              {SITE.name}
            </button>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--fog)]">
              Vibe marketing for {SITE.cohort}. Evidence lives on GitHub —
              {SITE.name} makes the trail worth following.
            </p>
            <p className="mt-2 font-mono text-[0.7rem] text-[var(--signal)]">
              {pings === 0
                ? `Tap the word ${SITE.name} for a ping`
                : `${SITE.name} ping ×${pings}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--fog)]">
            <Link href="/people" className="nav-link">
              Builders
            </Link>
            <Link href="/work" className="nav-link">
              Evidence
            </Link>
            <Link href="/partners" className="nav-link">
              Partners
            </Link>
            <Link href="/rsvp" className="nav-link">
              Event
            </Link>
            <Link href="/profile" className="nav-link">
              Profile
            </Link>
            <Link href="/partners/readme" className="nav-link">
              Partner README
            </Link>
          </div>
        </div>
        <p className="mt-8 text-xs text-[var(--fog)]/70">
          Built for the Summer Pilot contest · @{`kiaracaesar5627`}
        </p>
      </div>
    </footer>
  );
}
