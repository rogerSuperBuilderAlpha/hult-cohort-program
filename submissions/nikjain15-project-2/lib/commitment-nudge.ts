/**
 * Commitment nudges — the kind, client-side reminder shown next to an open promise on Home.
 *
 * Guardrail #4 (be kind to the quiet): a nudge NEVER shames. An overdue promise is framed as
 * "still counts, whenever you can" — encouragement, not a red LATE badge — because a missed
 * commitment is never penalized (no negative XP anywhere). This is pure so it's unit-tested; the
 * caller passes `nowMs` (no clock inside) so the logic is deterministic under test.
 */

const SOON_MS = 24 * 3_600_000; // 24h — same "due soon" horizon the Brief uses.

export type NudgeTone = 'overdue' | 'due-soon' | 'scheduled' | 'none';

export type CommitmentNudge = {
  tone: NudgeTone;
  /** Short chip label. Warm for overdue; plain for the rest. */
  label: string;
};

/**
 * Given a commitment's due time (or null if undated) and the current time, return the nudge chip.
 * Undated promises get no nudge — we only remind about something the person themselves put a time on.
 */
export function commitmentNudge(dueAtMs: number | null, nowMs: number): CommitmentNudge {
  if (dueAtMs == null) return { tone: 'none', label: '' };
  const delta = dueAtMs - nowMs;
  if (delta < 0) return { tone: 'overdue', label: 'Still counts — whenever you can' };
  if (delta <= SOON_MS) return { tone: 'due-soon', label: 'Due soon' };
  return { tone: 'scheduled', label: `Due ${formatDue(dueAtMs)}` };
}

/** Sort key so the "You promised" band leads with what's most time-sensitive; undated sink last. */
export function nudgeSortKey(dueAtMs: number | null): number {
  return dueAtMs == null ? Number.MAX_SAFE_INTEGER : dueAtMs;
}

function formatDue(ms: number): string {
  return new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric' });
}
