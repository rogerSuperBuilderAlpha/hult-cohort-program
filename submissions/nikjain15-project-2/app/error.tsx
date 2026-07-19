'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/**
 * The last resort — never a raw Firebase code, never a bare "Something went wrong".
 * Without this file a thrown render error shows Next's default page (a stack trace in dev, a
 * blank apology in prod); neither tells the person their messages are safe and the rest works.
 * reset() is offered first because most render errors are transient. The digest is not shown —
 * it means nothing to the reader, and not doing that is this page's whole job.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('rally: render error', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <p className="text-body text-navy">This screen broke. Nothing you sent is lost.</p>
      <p className="max-w-md text-sm text-slate-500">
        Your messages and the cohort&apos;s activity live in the database, not on this page.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={reset}
          className="inline-flex h-10 items-center rounded-md bg-blurple px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blurple-600 focus:outline-none focus:ring-4 focus:ring-blurple/10"
        >
          Try again
        </button>
        <Link
          href="/home"
          className="inline-flex h-10 items-center rounded-md border border-slate-200 px-5 text-sm text-slate-600 transition-colors hover:bg-slate-100"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
