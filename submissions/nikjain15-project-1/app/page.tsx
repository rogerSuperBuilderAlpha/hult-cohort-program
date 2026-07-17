import { HomeOrLanding } from '@/components/HomeOrLanding';
import { participantsOnly } from '@/lib/pre-index';
import { buildCohortSnapshot } from '@/lib/pre-index';

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

  return (
    <HomeOrLanding
      snapshot={{ ...snapshot, members: participantsOnly(snapshot.members) }}
    />
  );
}
