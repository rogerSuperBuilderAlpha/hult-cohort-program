'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

/** One real, public event the hero cycles through. Facts only — a handle and a PR number,
 *  the same public record the landing shows. Never a model-written sentence about a member. */
export type SignalEvent = { handle: string; pr: number };

/** Firebase error codes are not user-facing English. Translate the ones people actually hit. */
function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'That email and password don’t match. Try again, or create an account.';
    case 'auth/email-already-in-use':
      return 'That email already has an account — sign in instead.';
    case 'auth/weak-password':
      return 'Password needs to be at least 6 characters.';
    case 'auth/invalid-email':
      return 'That doesn’t look like an email address.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window closed before finishing.';
    case 'auth/account-exists-with-different-credential':
      return 'You already have an account with this email — sign in with your password.';
    case 'auth/configuration-not-found':
      return 'GitHub sign-in isn’t configured yet. Use email and password.';
    default:
      return (err as Error)?.message ?? 'Something went wrong. Try again.';
  }
}

/**
 * The sign-in landing. Its one job is to earn the GitHub connect: show Pulse working on the
 * real cohort, say plainly what it does with the connection, and reassure before asking.
 *
 * The cohort snapshot is fetched server-side (see the page) and handed down, so this stays a
 * client component only for the auth form and the live cycling — no client-side GitHub calls.
 *
 * DESIGN-SPEC §4: sentence case, hairline borders, cards on zinc-900, two weights. Motion is a
 * single ~200ms fade between events, and it stops for prefers-reduced-motion — nothing else moves.
 * The auth form's labels, placeholders and button names are pinned by the smoke suite; don't touch them.
 */
export function SignInLanding({
  shipped,
  enrolled,
  events,
}: {
  shipped: number;
  enrolled: number;
  events: SignalEvent[];
}) {
  const { user, loading, signInWithGithub, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const dest = useRef('/');
  useEffect(() => {
    if (!loading && user) router.replace(dest.current);
  }, [user, loading, router]);

  async function run(fn: () => Promise<void>, next = '/') {
    setError('');
    setBusy(true);
    dest.current = next;
    try {
      await fn();
    } catch (err) {
      dest.current = '/';
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
      <div className="mb-10 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
        <span className="text-sm font-medium text-zinc-100">Pulse</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
        {/* -------- left: what's happening -------- */}
        <div>
          <h1 className="text-3xl font-medium leading-[1.1] tracking-tight text-zinc-100 sm:text-4xl">
            It reads the work.
            <br className="hidden sm:block" /> You just ship.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
            The board that updates itself — it senses what you ship, remembers how you solved it, and
            connects you with whoever cracked what you&rsquo;re stuck on. Before you ask.
          </p>
          <SelfWritingSignal events={events} />

          {shipped > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs text-zinc-400">The cohort this week</p>
              <div
                className="flex flex-wrap gap-1.5"
                role="img"
                aria-label={`${shipped} of ${enrolled} enrolled have shipped this week`}
              >
                {Array.from({ length: enrolled }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-3.5 w-3.5 rounded-[3px] transition-colors ${
                      i < shipped ? 'bg-emerald-400' : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
                <span className="font-medium tabular-nums text-zinc-100">
                  {shipped} of {enrolled}
                </span>
                shipped this week
                <span className="ml-1 inline-flex items-center gap-1.5 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                  live
                </span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                Every square is a real, public pull request. Yours lights up the moment you connect.
              </p>
            </div>
          )}
        </div>

        {/* -------- right: sign in -------- */}
        <div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="mb-5 text-sm text-zinc-300">Sign in — yours is waiting.</p>

            <button
              onClick={() => run(signInWithGithub)}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:opacity-50"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              Continue with GitHub
            </button>
            <p className="mt-2 text-center text-xs text-zinc-500">
              Pulse reads your public commits and PRs — that&rsquo;s all it needs.
            </p>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-xs text-zinc-500">or use email</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(
                  () =>
                    mode === 'signin'
                      ? signInWithEmail(email, password)
                      : signUpWithEmail(email, password, name || email.split('@')[0]),
                  mode === 'signin' ? '/' : '/connect'
                );
              }}
              className="space-y-3"
            >
              {mode === 'signup' && (
                <input
                  type="text"
                  aria-label="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                />
              )}
              <input
                type="email"
                required
                aria-label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />
              <input
                type="password"
                required
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />

              {error && (
                <p role="alert" className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white disabled:opacity-50"
              >
                {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-zinc-400">
              {mode === 'signin' ? 'New to the cohort?' : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError('');
                }}
                className="text-zinc-300 underline underline-offset-4 hover:text-white"
              >
                {mode === 'signin' ? 'Create an account' : 'Sign in'}
              </button>
            </p>

            {/* the trust line that earns the connect */}
            <p className="mt-6 text-xs leading-relaxed text-zinc-500">
              Facts only. Pulse writes a sentence about you only with your yes — and you can turn it
              off, make it ask first, or delete anything it posted, any time.
            </p>
          </div>
        </div>
      </div>

      {/* -------- how it works: horizontal, full width, under both columns -------- */}
      <div className="mt-14 border-t border-zinc-800 pt-8">
        <h2 className="mb-6 text-xs text-zinc-400">How it works</h2>
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-10">
          <StepH n="1" name="Connect GitHub">
            Pulse reads your public commits and PRs. It never sees your private code.
          </StepH>
          <StepH n="2" name="It writes your week">
            Pulse moves your cards and posts what you shipped — on its own, before you switch tabs.
          </StepH>
          <StepH n="3" name="Your team sees it">
            The moment it happens. Nobody types a status update, least of all you.
          </StepH>
        </div>
      </div>
    </main>
  );
}

/** One horizontal how-it-works step — number above, title, then detail. */
function StepH({ n, name, children }: { n: string; name: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 text-xs tabular-nums text-zinc-400">
        {n}
      </div>
      <p className="text-sm font-medium text-zinc-100">{name}</p>
      <p className="mt-1 text-sm leading-relaxed text-zinc-400">{children}</p>
    </div>
  );
}

/**
 * The line that writes itself. It fades from one real event to the next every few seconds —
 * the tagline, demonstrated. A fade, not a typewriter, so it stays inside the motion rule; and
 * it holds still for anyone who asked for reduced motion.
 */
function SelfWritingSignal({ events }: { events: SignalEvent[] }) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (events.length <= 1) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      setShown(false);
      const swap = setTimeout(() => {
        setIdx((i) => (i + 1) % events.length);
        setShown(true);
      }, 220);
      return () => clearTimeout(swap);
    }, 3200);
    return () => clearInterval(timer);
  }, [events.length]);

  if (events.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
        <p className="text-sm text-zinc-400">Reading the cohort&rsquo;s public repo…</p>
      </div>
    );
  }

  const ev = events[idx];
  return (
    <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
      <p className="text-xs text-zinc-500">Pulse is reading the cohort, right now</p>
      <p
        className={`mt-1 text-sm text-zinc-100 transition-opacity duration-200 ${
          shown ? 'opacity-100' : 'opacity-0'
        }`}
      >
        @{ev.handle} <span className="text-zinc-400">— PR #{ev.pr}</span>
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
        just now · read live, nothing typed in
      </p>
    </div>
  );
}
