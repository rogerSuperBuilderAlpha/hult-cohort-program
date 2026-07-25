import type { CohortHandle } from './types';

/**
 * The cohort roster — single source of truth for "who is in the program".
 *
 * 65 enrolled (see memory hult-cohort-program-facts). The authoritative list is the set of
 * participant submission folders in this repo plus the enrolment roll; until the app is wired
 * to read those live, ENROLLED is the count the UI quotes and the roster is seeded on first
 * sign-in. Never invent members to pad a feed — a real roster of the people actually here is
 * the honest basis both cohort apps share.
 */
export const ENROLLED = 65;

/** Case-insensitive membership: GitHub logins are case-preserving but case-insensitive. */
export function sameHandle(a: CohortHandle | null, b: CohortHandle | null): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

/** Find a handle within a roster, case-insensitively. */
export function findHandle(roster: CohortHandle[], handle: CohortHandle | null): CohortHandle | null {
  if (!handle) return null;
  const needle = handle.toLowerCase();
  return roster.find((h) => h.toLowerCase() === needle) ?? null;
}

/** Default channels every member is joined into on first sign-in. */
export const DEFAULT_CHANNELS: { slug: string; name: string }[] = [
  { slug: 'general', name: 'General' },
  { slug: 'help', name: 'Help' },
  { slug: 'wins', name: 'Wins' },
];
