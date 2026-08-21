'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { greetingFirstName, profileIsComplete } from '@/lib/auth/profile-sign-in';
import { SITE } from '@/lib/site';

export type SessionProfile = {
  email: string;
  name?: string;
  companyName?: string;
  username?: string;
};

export function HomeSignInSheet({ profile }: { profile: SessionProfile | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(profile);
  const panelRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: profile?.name ?? '',
    email: profile?.email ?? '',
    username: profile?.username ?? '',
  });

  const complete = profileIsComplete(signedIn);
  const greeting = greetingFirstName(signedIn);

  useEffect(() => {
    setSignedIn(profile);
    if (profile?.name || profile?.email || profile?.username) {
      setForm({
        name: profile.name ?? '',
        email: profile.email ?? '',
        username: profile.username ?? '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (searchParams.get('signin') === '1' || searchParams.get('event') === '1') {
      setOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  function submitSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        profile?: SessionProfile;
      };
      if (!res.ok) {
        setError(data.error ?? 'Sign-in failed');
        return;
      }
      setSignedIn(data.profile ?? null);
      setOpen(false);
      router.replace('/');
      router.refresh();
    });
  }

  function signOut() {
    setError(null);
    startTransition(async () => {
      await fetch('/api/auth/sign-out', { method: 'POST' });
      setSignedIn(null);
      setForm({ name: '', email: '', username: '' });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 transition hover:border-emerald-300 hover:bg-emerald-50/50"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
          {complete ? greeting[0]?.toUpperCase() : '👤'}
        </div>
        <div className="text-left text-xs">
          <p className="font-semibold text-slate-800">Hi, {greeting}</p>
          <p className="max-w-[140px] truncate text-slate-500">
            {complete ? `@${signedIn?.username}` : 'Sign in to continue'}
          </p>
        </div>
        <span className="text-slate-400" aria-hidden>
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Sign in"
          className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
        >
          {complete ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Welcome back
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">Hi, {greeting}</p>
                <p className="text-sm text-slate-600">{signedIn?.name}</p>
                <p className="text-xs text-slate-500">@{signedIn?.username}</p>
                <p className="text-xs text-slate-500">{signedIn?.email}</p>
              </div>
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
                Your identity is tied to your session so bills can be reviewed for discrepancies
                while keeping your data private and secure.
              </p>
              <div className="space-y-2">
                <Link
                  href="/bills"
                  className="block rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                  onClick={() => setOpen(false)}
                >
                  My Bills
                </Link>
                <Link
                  href="/calculator"
                  className="block rounded-lg border border-emerald-600 px-4 py-2 text-center text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
                  onClick={() => setOpen(false)}
                >
                  Energy Calculator
                </Link>
                <a
                  href={SITE.listingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Ludwitt Creator listing →
                </a>
                <a
                  href={SITE.marketplaceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Ludwitt Marketplace →
                </a>
                <Link
                  href="/api/auth/ludwitt"
                  className="block text-center text-xs font-semibold text-emerald-700 underline"
                  onClick={() => setOpen(false)}
                >
                  Sign in with Ludwitt OAuth
                </Link>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={signOut}
                className="w-full text-sm text-slate-500 underline hover:text-slate-700"
              >
                Sign out
              </button>
            </div>
          ) : (
            <form onSubmit={submitSignIn} className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Sign in
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Tell us who you are so we can greet you by name and keep your bill data tied to
                  your account for secure review.
                </p>
              </div>
              <label className="block text-xs font-medium text-slate-700">
                Full name
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ryan Roper"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  autoComplete="name"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Username
                <input
                  required
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  pattern="[a-zA-Z0-9_-]{3,30}"
                  title="3–30 characters: letters, numbers, underscore or hyphen"
                  placeholder="ryan_r"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  autoComplete="username"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Email address
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@company.com"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  autoComplete="email"
                />
              </label>
              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-900" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {pending ? 'Signing in…' : 'Sign in'}
              </button>
              <p className="text-[10px] leading-snug text-slate-400">
                Bill uploads and calculator results are linked to your username and email — not
                shared publicly.{' '}
                <Link href="/privacy" className="font-semibold text-emerald-700 underline">
                  Privacy policy
                </Link>
                {' · '}
                <a
                  href={SITE.listingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-emerald-700 underline"
                >
                  Ludwitt app
                </a>
              </p>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
