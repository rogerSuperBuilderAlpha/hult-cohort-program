import Link from "next/link";
import { COHORT, URLS } from "@/lib/config";

export function PulseFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--glass-border)] glass">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-mono text-xs text-[var(--ink-muted)]">
            {COHORT.name} · {COHORT.term}
          </p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Inspect the GitHub, not the pitch.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/partners" className="text-[var(--accent)] hover:underline">
            Partner portal
          </Link>
          <a
            href={URLS.winningPm}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            Forth PM
          </a>
          <a
            href={URLS.winningComms}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            Cohort Comms
          </a>
        </div>
      </div>
    </footer>
  );
}
