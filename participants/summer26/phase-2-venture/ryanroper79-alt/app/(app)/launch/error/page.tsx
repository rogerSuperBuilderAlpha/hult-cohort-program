import Link from 'next/link';
import { SITE } from '@/lib/site';

type Props = { searchParams: Promise<{ reason?: string }> };

export default async function LaunchErrorPage({ searchParams }: Props) {
  const { reason } = await searchParams;
  return (
    <section className="mx-auto max-w-lg space-y-6 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
          Couldn&apos;t start session
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ceal-900">Sign in with Ludwitt</h1>
        <p className="mt-2 text-sm text-ceal-800/90">
          This launch link wasn&apos;t accepted. Sign in with Ludwitt, or ask your cohort contact
          for a fresh platform launch link.
          {reason ? (
            <>
              {' '}
              <span className="block mt-2 font-mono text-xs text-red-800">Detail: {reason}</span>
            </>
          ) : null}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/api/auth/ludwitt"
          className="rounded-lg bg-ceal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ceal-700"
        >
          Sign in with Ludwitt
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-ceal-600 px-4 py-2 text-sm font-semibold text-ceal-800 hover:bg-ceal-50"
        >
          More sign-in options
        </Link>
        {SITE.listingUrl ? (
          <a
            href={SITE.listingUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-ceal-500/30 px-4 py-2 text-sm font-semibold text-ceal-700 hover:bg-ceal-50"
          >
            Marketplace listing
          </a>
        ) : null}
        <Link
          href="/"
          className="self-center text-sm text-ceal-700 underline"
        >
          Home
        </Link>
      </div>
    </section>
  );
}
