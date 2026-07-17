'use client';

import { relativeTime } from '@/lib/sense';
import type { SyncOutcome } from '@/lib/sync';

/**
 * What sensing just did, said out loud.
 *
 * **Degrade loudly** — the rule this component exists for. A board that quietly stops
 * updating looks identical to a board where nothing happened, and the difference matters
 * enormously: one is "nobody shipped today", the other is "Pulse is lying to you". So a
 * failed sync says so, in plain language, with what to expect next.
 *
 * A successful sync is deliberately quiet — a line, not a celebration. Pulse doing its
 * job is the baseline, not an achievement.
 */
export function SyncNote({ outcome }: { outcome: SyncOutcome | null }) {
  if (!outcome || outcome.kind === 'off') return null;

  if (outcome.kind === 'degraded') {
    return (
      <p
        role="status"
        className="mb-3 rounded border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-300"
      >
        {outcome.failure === 'rate_limited' ? (
          <>
            GitHub is rate-limiting us, so this board might be behind.
            {outcome.resetAt && ` Trying again after ${timeOfDay(outcome.resetAt)}.`} Everything
            here still works — Pulse just isn’t adding to it right now.
          </>
        ) : (
          <>
            Can’t reach GitHub, so this board might be behind. Nothing is lost, and you can still
            add and move cards yourself.
          </>
        )}
      </p>
    );
  }

  if (outcome.created === 0 && outcome.moved === 0) return null;

  return (
    <p role="status" className="mb-3 text-xs text-zinc-500">
      Pulse {summarise(outcome.created, outcome.moved)} from your GitHub,{' '}
      {relativeTime(outcome.at)}.
    </p>
  );
}

function summarise(created: number, moved: number): string {
  const parts: string[] = [];
  if (created > 0) parts.push(`built ${created} ${created === 1 ? 'card' : 'cards'}`);
  if (moved > 0) parts.push(`moved ${moved}`);
  return parts.join(' and ');
}

function timeOfDay(at: Date): string {
  return at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
