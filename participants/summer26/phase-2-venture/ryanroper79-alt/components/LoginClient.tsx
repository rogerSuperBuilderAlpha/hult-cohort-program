'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export function LoginClient({
  oauthReady,
  error: initialError,
}: {
  oauthReady: boolean;
  error?: string | null;
}) {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [showHelp, setShowHelp] = useState(false);
  const [pending, startTransition] = useTransition();

  function submitToken() {
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/auth/ludwitt-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Sign-in failed (${res.status})`);
        return;
      }
      router.replace('/calculator');
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ceal-600">Ludwitt</p>
        <h1 className="mt-1 text-2xl font-bold text-ceal-900">Sign in</h1>
        <p className="mt-2 text-sm text-ceal-800/90">
          CEAL Green Energy Auditor is listed on the Ludwitt marketplace. Sign in so your calculator
          session counts toward platform metrics.
        </p>
      </div>

      {oauthReady ? (
        <Link
          href="/api/auth/ludwitt"
          className="inline-flex w-full items-center justify-center rounded-lg bg-ceal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-ceal-700"
        >
          Sign in with Ludwitt
        </Link>
      ) : (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          Ludwitt sign-in is not configured on this deployment. Use a Creator test token below, or
          open a platform launch link.
        </p>
      )}

      <p className="text-sm text-ceal-700">
        New here?{' '}
        <Link href="/api/auth/ludwitt" className="font-semibold text-ceal-800 underline">
          Create an account on Ludwitt
        </Link>
      </p>

      <div className="rounded-xl border border-ceal-500/20 bg-white p-4">
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          className="text-sm font-semibold text-ceal-800 underline"
        >
          {showHelp ? 'Hide' : 'Having trouble signing in?'}
        </button>
        {showHelp ? (
          <div className="mt-4 space-y-3 text-sm text-ceal-800/90">
            <p>
              Prefer the Ludwitt button above. For grading or local checks, mint a Creator test
              token (starts with <code className="rounded bg-ceal-100 px-1">lt_</code>), paste it
              below, and continue.
            </p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                Open{' '}
                <a
                  href={SITE.creatorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold underline"
                >
                  Ludwitt Creator
                </a>
              </li>
              <li>
                Click <strong>Mint test token</strong>, copy the value
              </li>
              <li>Paste it below and continue</li>
            </ol>
            <label htmlFor="creator-token" className="block font-medium text-ceal-900">
              Creator test token
            </label>
            <textarea
              id="creator-token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="lt_…"
              rows={3}
              className="w-full rounded-lg border border-ceal-500/30 px-3 py-2 font-mono text-sm"
            />
            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-red-900" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={pending || !token.trim().startsWith('lt_')}
              onClick={submitToken}
              className="rounded-lg border border-ceal-600 px-4 py-2 text-sm font-semibold text-ceal-800 hover:bg-ceal-50 disabled:opacity-50"
            >
              {pending ? 'Signing in…' : 'Continue with test token'}
            </button>
          </div>
        ) : null}
      </div>

      {SITE.listingUrl ? (
        <p className="text-xs text-ceal-700">
          Ludwitt Creator:{' '}
          <a href={SITE.listingUrl} target="_blank" rel="noreferrer" className="underline">
            CEAL Green Energy Auditor
          </a>
          {' · '}
          <a href={SITE.marketplaceUrl} target="_blank" rel="noreferrer" className="underline">
            Browse marketplace
          </a>
        </p>
      ) : null}
    </div>
  );
}
