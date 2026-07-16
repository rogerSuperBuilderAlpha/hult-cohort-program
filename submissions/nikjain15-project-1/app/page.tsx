'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

/**
 * Root.
 *
 * This is where the landing page goes — the signed-out view that shows a visitor
 * their own week, read from the public cohort repo, before they ever sign up
 * (DESIGN-SPEC §5.0), and the feed once they're in (§6).
 *
 * Until those exist, this routes rather than renders. It must decide based on auth
 * state, not redirect unconditionally: /signin sends signed-in users back here, so
 * a blind redirect to /signin makes the two pages bounce off each other forever.
 */
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/signin');
  }, [user, loading, router]);

  if (loading) return null;

  if (!user) return null; // redirecting

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">You&rsquo;re in.</h1>
      <p className="max-w-sm text-sm text-zinc-400">
        Signed in as {user.email}. The cohort feed lands here next.
      </p>
      <a href="/signin" className="mt-2 text-xs text-zinc-500 underline">
        sign in as someone else
      </a>
    </main>
  );
}
