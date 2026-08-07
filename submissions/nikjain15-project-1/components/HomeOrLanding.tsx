'use client';

import { useAuth } from '@/lib/auth-context';
import type { CohortSnapshot } from '@/lib/cohort';
import { Home } from './Home';
import { Landing } from './Landing';

/**
 * Picks the landing page or home, based on auth.
 *
 * Split out from the page so `/` can stay a server component: the snapshot is fetched and
 * rendered server-side, and only this decision needs the client.
 */
export function HomeOrLanding({ snapshot }: { snapshot: CohortSnapshot }) {
  const { user, loading } = useAuth();

  // Nothing, briefly — flashing the landing page at a signed-in member would be worse
  // than a beat of blank.
  if (loading) return null;

  if (!user) return <Landing snapshot={snapshot} />;

  // Spec §6: the posted row, the standing ask, the pulse strip and the live feed.
  // Home brings its own AppShell — the header carries sign-out, so the placeholder's
  // bespoke one is gone with it.
  return <Home />;
}
