'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * The last resort — DESIGN-SPEC §10: never a raw Firebase code, never a bare
 * "Something went wrong".
 *
 * Without this file a thrown render error shows Next's default error page, which is both
 * of those things at once: a stack trace in dev, a blank apology in prod. Neither tells a
 * reviewer what is still true, which is that their work is safe and the rest of the app
 * works.
 *
 * `reset()` is offered first because most render errors are transient — a listener that
 * arrived mid-update, a value that wasn't there yet. Retrying in place beats losing the
 * page. The digest is deliberately not shown: it means nothing to the person reading it,
 * and this file's whole job is to not do that.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // The detail belongs in the console, where whoever is debugging will look — not in
    // the face of someone who just wanted to see the board.
    console.error('pulse: render error', error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <div>
        <p className="text-sm text-zinc-300">This screen broke. Nothing you did is lost.</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
          Your projects and tasks are safe — they live in the database, not on this page.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={reset}
          className="min-h-11 rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-400"
        >
          Try again
        </button>
        <Link
          href="/board"
          className="min-h-11 rounded border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
        >
          Go to the board
        </Link>
      </div>
    </main>
  );
}
