import Link from 'next/link';

/**
 * 404 — DESIGN-SPEC §10.
 *
 * Until now this was Next's default: "404: This page could not be found." A reviewer
 * clicking a stale link met the framework, not the product — and the framework's voice
 * is nobody's.
 *
 * The copy is the spec's, verbatim, and the second clause is the whole point: a dead end
 * that still tells you the cohort is there is a route back in, not an apology. It sends
 * you to the feed rather than the sign-in page, because the feed is the thing that's
 * worth arriving at.
 *
 * A server component with no listeners on purpose — this page has to render when
 * something else is already broken.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-zinc-300">That page isn’t here. The cohort still is, though.</p>
      <Link
        href="/"
        className="mt-4 min-h-11 rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-400"
      >
        See the cohort’s week
      </Link>
    </main>
  );
}
