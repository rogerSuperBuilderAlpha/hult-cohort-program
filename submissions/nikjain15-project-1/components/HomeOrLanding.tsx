'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { CohortSnapshot } from '@/lib/cohort';
import { Landing } from './Landing';

/**
 * Picks the landing page or home, based on auth.
 *
 * Split out from the page so `/` can stay a server component: the snapshot is fetched and
 * rendered server-side, and only this decision needs the client.
 */
export function HomeOrLanding({ snapshot }: { snapshot: CohortSnapshot }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Nothing, briefly — flashing the landing page at a signed-in member would be worse
  // than a beat of blank.
  if (loading) return null;

  if (!user) return <Landing snapshot={snapshot} />;

  return <SignedIn onSignOut={() => router.replace('/signin')} />;
}

/**
 * Placeholder for the signed-in feed (spec §6): the posted row, the standing ask, the
 * pulse strip and the live feed. Build step 7.
 */
function SignedIn({ onSignOut }: { onSignOut: () => void }) {
  const { user, signOut } = useAuth();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">You&rsquo;re in.</h1>
      <p className="max-w-sm text-sm text-zinc-400">
        Signed in as {user?.email}. The cohort feed lands here next.
      </p>
      <button
        // Signs out first. Linking straight to /signin was a dead end: that page sends
        // signed-in users back here, so the two bounced off each other.
        onClick={() => signOut().then(onSignOut)}
        className="mt-2 text-xs text-zinc-500 underline"
      >
        sign in as someone else
      </button>
    </main>
  );
}
