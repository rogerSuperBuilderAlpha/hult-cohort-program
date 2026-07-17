'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

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

export default function SignInPage() {
  const { user, loading, signInWithGithub, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Where to go once auth resolves — ONE redirect path, not two. There used to be an
  // explicit router.replace here AND this effect firing on `user`, and they raced: a fresh
  // sign-up would sometimes land on '/' instead of '/connect' depending on which won. Now
  // the auth action records its intended destination and the effect is the only redirector.
  // Default '/': a visitor who is already signed in and lands on /signin just bounces home.
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
      // No redirect here — the effect above fires once `user` flips, using dest.current.
    } catch (err) {
      // Reset intent so a later success doesn't inherit a stale destination.
      dest.current = '/';
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Pulse</h1>
          <p className="mt-2 text-sm text-zinc-400">
            The board that fills itself in. You do the work — it writes it down.
          </p>
        </div>

        <button
          onClick={() => run(signInWithGithub)}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:opacity-50"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          Continue with GitHub
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs text-zinc-400">or</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            // A brand-new account has never seen the consent gate — send it there, per
            // spec §5.2. /connect is the one screen that buys autonomy, and a sign-up that
            // skips it leaves sensing switched off with nothing pointing the way in. A
            // returning sign-in has already decided, so it lands home.
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
          {/*
            aria-label on each field, not just a placeholder. A placeholder is not an
            accessible name — a screen reader announces a bare "edit text", and the hint
            vanishes the moment someone types. This is the front door of the app, and it
            was the one form that missed the label discipline the rest of the app uses.
            focus:ring so the focus state is visible, not a 1.5:1 border change on dark.
          */}
          {mode === 'signup' && (
            <input
              type="text"
              aria-label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
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
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
          />
          <input
            type="password"
            required
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
          />

          {error && (
            <p role="alert" className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
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
      </div>
    </main>
  );
}
