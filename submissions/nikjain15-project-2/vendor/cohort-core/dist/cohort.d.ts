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
export declare const ENROLLED = 65;
/** Case-insensitive membership: GitHub logins are case-preserving but case-insensitive. */
export declare function sameHandle(a: CohortHandle | null, b: CohortHandle | null): boolean;
/** Find a handle within a roster, case-insensitively. */
export declare function findHandle(roster: CohortHandle[], handle: CohortHandle | null): CohortHandle | null;
/** Default channels every member is joined into on first sign-in. */
export declare const DEFAULT_CHANNELS: {
    slug: string;
    name: string;
}[];
