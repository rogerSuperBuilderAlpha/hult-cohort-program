"use client";

import Link from "next/link";
import { useVibe } from "./PulseShell";
import { PulseWordmark } from "./PulseWordmark";

const NAV = [
  { href: "/", label: "Pulse" },
  { href: "/builders", label: "Builders" },
  { href: "/showcase", label: "Showcase" },
  { href: "/partners", label: "Partners" },
];

export function PulseHeader() {
  const { cycleVibe, vibeLabel } = useVibe();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--glass-border)] glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <PulseWordmark size="sm" />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--accent)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={cycleVibe}
          className="vibe-toggle"
          title={`Cycle vibe — ${vibeLabel}`}
        >
          <span className="vibe-toggle-glow" aria-hidden />
          <span className="relative">◐ {vibeLabel}</span>
        </button>
      </div>
    </header>
  );
}
