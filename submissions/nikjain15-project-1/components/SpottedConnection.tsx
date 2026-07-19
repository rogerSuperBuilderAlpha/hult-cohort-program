'use client';

import { useState } from 'react';
import { COHORT_REPO_SLUG } from '@/lib/github-repo';
import type { Connection } from '@/lib/connections';
import type { Member } from '@/lib/types';

/**
 * "Pulse spotted a connection" — the one collaborative nudge on Home.
 *
 * It surfaces at most one suggestion, on your own Home, built entirely from PUBLIC facts
 * (lib/connections): another member's public PR that overlaps your work. It names them (a
 * public handle) and quotes their PR verbatim (public record) — it never characterises them,
 * never says anyone is stuck, never ranks. "See their PR" links to the public PR; "not now"
 * dismisses this suggestion. There is no write here and nothing is published — comparing
 * notes is left to the two people.
 */
export function SpottedConnection({
  connection,
  members,
}: {
  connection: Connection;
  members: Member[];
}) {
  const storageKey = `pulse:conn-dismissed:${connection.prNumber}`;
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  });
  if (dismissed) return null;

  // Resolve the public handle to a member's display name if they've joined; otherwise show
  // the handle. Never guess a name.
  const name =
    members.find((m) => m.handle?.toLowerCase() === connection.handle.toLowerCase())?.displayName ??
    `@${connection.handle}`;
  const topic = connection.sharedTerms[0] ?? 'the same area';
  const prUrl = `https://github.com/${COHORT_REPO_SLUG}/pull/${connection.prNumber}`;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(storageKey, '1');
    } catch {
      /* no storage — it just won't be remembered next visit */
    }
  };

  return (
    <div className="pulse-row-in border-l-2 border-sky-500/60 pl-3.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs text-sky-400">
        <span aria-hidden>◇</span>
        <span>Pulse spotted a connection &middot; from public work</span>
      </div>
      <p className="text-[15px] text-zinc-100">
        You and {name} are both working on {topic}.
      </p>
      <div className="mt-2.5 flex items-center gap-4 text-sm">
        <a
          href={prUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 underline underline-offset-2 hover:text-sky-300"
        >
          see their PR
        </a>
        <span className="text-zinc-600" title={connection.prTitle}>
          PR #{connection.prNumber}
        </span>
        <button
          onClick={dismiss}
          className="ml-auto min-h-11 text-xs text-zinc-500 hover:text-zinc-400"
        >
          not now
        </button>
      </div>
    </div>
  );
}
