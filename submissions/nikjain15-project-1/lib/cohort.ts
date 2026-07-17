import type { CohortMember, Evidence } from './types';

/**
 * The cohort as read from the public repo, before anyone signs up.
 *
 * This is the shape the landing page renders. It is deliberately serialisable and free of
 * Firestore types: the pre-index runs server-side and hands this straight to a page that
 * a signed-out visitor loads, so there's no auth and no client SDK in the path.
 */
export type PublicMember = {
  handle: string;
  evidence: Evidence;
  /** ISO. Serialisable — a Timestamp would not survive the server→client boundary. */
  lastSeenAt: string;
  narrationOptIn: boolean;
};

export type CohortSnapshot = {
  members: PublicMember[];
  /** Total people enrolled. Not derived from the repo — most of them haven't pushed. */
  enrolled: number;
  /** When this was read. The feed says "as of" rather than pretending to be live. */
  fetchedAt: string;
  /** Set when GitHub degraded. The UI must say so rather than show stale data as fresh. */
  degraded: null | { kind: 'rate_limited' | 'unreachable'; resetAt: string | null };
};

/**
 * 65 enrolled, and Pulse can recognise about 7 of them.
 *
 * That gap is the landing page's whole argument, not something to paper over: "7 people
 * have shipped this week. You're not one of them yet." Inventing members to make the feed
 * look busy would trade the strongest claim this submission has — that its data is real —
 * for a prettier screenshot.
 */
export const ENROLLED = 65;

/** Case-insensitive: GitHub logins are case-preserving but case-insensitive. */
export function findMember(members: PublicMember[], handle: string | null): PublicMember | null {
  if (!handle) return null;
  const needle = handle.toLowerCase();
  return members.find((m) => m.handle.toLowerCase() === needle) ?? null;
}

export function toPublicMember(doc: CohortMember): PublicMember {
  return {
    handle: doc.handle,
    evidence: doc.evidence,
    lastSeenAt: doc.lastSeenAt.toDate().toISOString(),
    narrationOptIn: doc.narrationOptIn,
  };
}

/**
 * Most PRs first. This is a sort, not a ranking — there is no leaderboard, no position
 * number, and no score rendered next to anyone. It exists so the page opens on evidence
 * that the cohort is moving, which is the motivating fact.
 */
export function byActivity(members: PublicMember[]): PublicMember[] {
  return [...members].sort((a, b) => b.evidence.prNumbers.length - a.evidence.prNumbers.length);
}
