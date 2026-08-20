import Link from 'next/link';
import { readSession } from '@/lib/ludwitt/session';
import { Nav } from '@/components/Nav';
import { GreenularityLogo } from '@/components/GreenularityLogo';
import { SITE } from '@/lib/site';

export async function SiteHeader() {
  const session = await readSession();

  return (
    <header className="border-b border-ceal-500/20 bg-white/90 backdrop-blur-md">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ceal-600 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <GreenularityLogo size="md" href="/" />
          <p className="text-xs text-slate-500">{SITE.cohort}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <a
            href={SITE.bookNowUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-ceal-600 px-3 py-1 font-semibold text-white hover:bg-ceal-700"
          >
            Book Now
          </a>
          {session ? (
            <span className="rounded-full bg-ceal-500/10 px-3 py-1 text-xs text-ceal-800">
              {session.email}
            </span>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-ceal-500/30 px-3 py-1 text-ceal-800 hover:bg-ceal-500/10"
              >
                Sign in
              </Link>
              <Link
                href="/api/auth/ludwitt"
                className="rounded-full border border-ceal-600 px-3 py-1 font-semibold text-ceal-800 hover:bg-ceal-50"
              >
                Ludwitt
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-4">
        <Nav />
      </div>
    </header>
  );
}
