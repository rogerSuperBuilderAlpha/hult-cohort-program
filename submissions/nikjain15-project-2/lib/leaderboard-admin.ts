import type { Firestore } from 'firebase-admin/firestore';

/**
 * Leaderboard — computed server-side, neighbors-only by design.
 *
 * The kindness rule (memory be-kind-to-the-quiet, guardrail #5) forbids a full public ranking:
 * nobody should open Rally and see themselves at the bottom of a list of 65. So the FULL
 * ordering is computed here and never leaves the server — a caller gets only their own rank,
 * a ±2 window of neighbors, and the cooperative team total. That's motivating (you can always
 * see the rung above you) without being a public scoreboard of who's behind.
 *
 * XP is summed from the append-only ledger, never a stored total — same anti-gaming spine as
 * everywhere else.
 */

export type LeaderRow = { uid: string; total: number; rank: number };
export type LeaderboardResult = {
  me: LeaderRow | null;
  neighbors: LeaderRow[];
  /**
   * The top of the board — present ONLY when the caller opts in (see `includeTop`). This is the
   * one exception to "never return the full ordering", and a deliberately kind one: it celebrates
   * the LEADERS (being near the top is not a shame) and never enumerates who's at the bottom. The
   * full ranking still never leaves the server.
   */
  leaders?: LeaderRow[];
  teamTotal: number;
  teamGoal: { target: number; current: number };
  participants: number;
};

const NEIGHBOR_RADIUS = 2;

/**
 * Rank is ALWAYS computed by reducing the append-only ledger (guardrail #3: never a stored total).
 * But under concurrent load, N simultaneous leaderboard opens would each re-scan the whole ledger.
 * This is a short-lived, server-side cache of the COMPUTED result (a transient reduction, not a
 * stored per-user counter) so a burst of opens collapses to one scan per window per warm instance
 * — the same in-memory, best-effort pattern as the rate guard. It is invalidated the instant any XP
 * is awarded (see invalidateLeaderboard), so a caller never sees a stale board after a change; the
 * cache only ever serves reads that happen between writes. Correctness stays anchored to the ledger.
 */
const CACHE_TTL_MS = 15_000;
type RankedSnapshot = { ranked: LeaderRow[]; teamTotal: number; participants: number; computedAt: number };
let cache: RankedSnapshot | null = null;

/** Drop the cached ranking. Called by every award path so the next read recomputes from the ledger. */
export function invalidateLeaderboard(): void {
  cache = null;
}

async function rankedFromLedger(db: Firestore, nowMs: number): Promise<RankedSnapshot> {
  if (cache && nowMs - cache.computedAt < CACHE_TTL_MS) return cache;
  const snap = await db.collection('xpEvents').get();
  const totals = new Map<string, number>();
  let teamTotal = 0;
  for (const d of snap.docs) {
    const x = d.data();
    const p = x.profileUid as string;
    const pts = (x.points as number) ?? 0;
    totals.set(p, (totals.get(p) ?? 0) + pts);
    teamTotal += pts;
  }
  const ranked: LeaderRow[] = [...totals.entries()]
    .map(([u, total]) => ({ uid: u, total, rank: 0 }))
    .sort((a, b) => b.total - a.total || (a.uid < b.uid ? -1 : 1))
    .map((row, i) => ({ ...row, rank: i + 1 }));
  cache = { ranked, teamTotal, participants: ranked.length, computedAt: nowMs };
  return cache;
}

/** How many leaders the opt-in "full board" reveals. Small — a podium, not the whole ladder. */
const TOP_N = 5;

/** Per-team-member XP target; the cooperative goal scales with the cohort so it stays shared. */
const PER_MEMBER_GOAL = 50;

export async function computeLeaderboard(
  db: Firestore,
  uid: string,
  opts: { includeTop?: boolean; nowMs?: number } = {},
): Promise<LeaderboardResult> {
  // The expensive part — the ledger reduce + full sort — is shared across all callers via a short
  // TTL cache; each caller only slices their own window out of it (cheap). Rank is still computed
  // from the ledger, never stored.
  const { ranked, teamTotal } = await rankedFromLedger(db, opts.nowMs ?? Date.now());

  const meIdx = ranked.findIndex((r) => r.uid === uid);
  const me = meIdx >= 0 ? ranked[meIdx] : null;

  // A ±2 window around the caller. If the caller has no XP yet, show the bottom of the board
  // as an on-ramp rather than an empty panel.
  let neighbors: LeaderRow[];
  if (meIdx >= 0) {
    neighbors = ranked.slice(Math.max(0, meIdx - NEIGHBOR_RADIUS), meIdx + NEIGHBOR_RADIUS + 1);
  } else {
    neighbors = ranked.slice(Math.max(0, ranked.length - NEIGHBOR_RADIUS - 1));
  }

  const participants = ranked.length;
  const goalMembers = Math.max(participants, 1);

  return {
    me,
    neighbors,
    // Only the podium, and only when asked. Never the bottom of the board.
    ...(opts.includeTop ? { leaders: ranked.slice(0, TOP_N) } : {}),
    teamTotal,
    teamGoal: { target: goalMembers * PER_MEMBER_GOAL, current: teamTotal },
    participants,
  };
}
