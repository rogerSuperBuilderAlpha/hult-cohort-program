import { HomeOrLanding } from '@/components/HomeOrLanding';
import type { CohortSnapshot } from '@/lib/cohort';
import { removeOptedOut } from '@/lib/opt-out';
import { buildCohortSnapshot, participantsOnly } from '@/lib/pre-index';

/**
 * Root.
 *
 * A **server** component, so a signed-out visitor gets the cohort's real week with no
 * auth, no client Firebase, and no round-trip — the landing page is the product's first
 * argument and it must not wait on JavaScript to say anything.
 *
 * Signed in → home. Signed out → landing (§5.0). That decision is client-side because
 * Firebase auth is, so this hands the data down and lets the client pick.
 */

// The pre-index is cached upstream (15 min, matching the polling lag the product admits
// to). Revalidating here keeps a signed-out visitor off GitHub's rate limit entirely.
export const revalidate = 900;

export default async function Page() {
  const snapshot = await buildCohortSnapshot();

  return <HomeOrLanding snapshot={await visibleCohort(snapshot)} />;
}

/**
 * The cohort, minus anyone who asked to be removed.
 *
 * Fails CLOSED: if the opt-out list is unreadable we cannot prove nobody here asked to be
 * removed, so the page degrades to showing nothing rather than falling back to the
 * unfiltered list. That fallback would be the one failure this page must never have —
 * quietly displaying a person who explicitly asked not to be displayed. An empty page is
 * a bad day; that would be a broken promise.
 *
 * Kept out of the component so the try/catch wraps the data, never the JSX.
 */
async function visibleCohort(snapshot: CohortSnapshot): Promise<CohortSnapshot> {
  try {
    return { ...snapshot, members: await removeOptedOut(participantsOnly(snapshot.members)) };
  } catch {
    return { ...snapshot, members: [], degraded: { kind: 'unreachable', resetAt: null } };
  }
}
