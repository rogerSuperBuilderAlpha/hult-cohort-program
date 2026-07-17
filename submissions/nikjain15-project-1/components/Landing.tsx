'use client';

import Link from 'next/link';
import { useState } from 'react';
import { byActivity, findMember, type CohortSnapshot, type PublicMember } from '@/lib/cohort';
import { formatEvidence } from '@/lib/sense';
import { relativeTime } from '@/lib/sense';

/**
 * The landing page — `/` signed out. DESIGN-SPEC §5.0.
 *
 * Pulse pre-indexes whoever has pushed to the public cohort repo, so there is no signup
 * wall in front of the value: a stranger sees the cohort's real week before they ever
 * make an account.
 *
 * ⚠️ **Facts only on this page.** Merged PRs are public record; a model-written sentence
 * about someone who never opted in is not. `narrationOptIn` gates every generated
 * sentence, and it is false for everyone who hasn't signed up — so nothing here narrates.
 */
export function Landing({ snapshot }: { snapshot: CohortSnapshot }) {
  const [handle, setHandle] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const shipped = byActivity(snapshot.members);
  const me = findMember(snapshot.members, submitted);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-20">
      <header className="mb-10 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
        <span className="text-sm font-medium text-zinc-100">Pulse</span>
      </header>

      {snapshot.degraded ? (
        <Degraded snapshot={snapshot} />
      ) : submitted === null ? (
        <Ask
          handle={handle}
          setHandle={setHandle}
          onSubmit={() => setSubmitted(handle.trim().replace(/^@/, ''))}
          shipped={shipped}
        />
      ) : me ? (
        <Recognised me={me} shipped={shipped} />
      ) : (
        <Unknown handle={submitted} shipped={shipped} onBack={() => setSubmitted(null)} />
      )}

      <Cohort shipped={shipped} enrolled={snapshot.enrolled} fetchedAt={snapshot.fetchedAt} />
      <Disclosure />
    </main>
  );
}

/* ------------------------------------------------------------------ states */

function Ask({
  handle,
  setHandle,
  onSubmit,
  shipped,
}: {
  handle: string;
  setHandle: (v: string) => void;
  onSubmit: () => void;
  shipped: PublicMember[];
}) {
  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight text-zinc-100">
        {shipped.length} people have shipped this week.
      </h1>
      <p className="mt-3 text-sm text-zinc-400">
        Pulse already read the cohort&rsquo;s public repo. Tell it your GitHub handle and it will show
        you your week — no account needed.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (handle.trim()) onSubmit();
        }}
        className="mt-6 flex gap-2"
      >
        <label htmlFor="handle" className="sr-only">
          Your GitHub handle
        </label>
        <input
          id="handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="your-github-handle"
          autoComplete="off"
          className="min-h-11 flex-1 rounded border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!handle.trim()}
          className="min-h-11 rounded bg-emerald-500 px-4 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-400 disabled:opacity-40"
        >
          Show me
        </button>
      </form>
    </section>
  );
}

function Recognised({ me, shipped }: { me: PublicMember; shipped: PublicMember[] }) {
  const rest = shipped.filter((m) => m.handle !== me.handle);

  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight text-zinc-100">
        You&rsquo;re @{me.handle}. Here&rsquo;s your week already.
      </h1>

      <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-sm text-zinc-100">
          {me.evidence.prNumbers.length === 1
            ? '1 pull request'
            : `${me.evidence.prNumbers.length} pull requests`}{' '}
          in the cohort repo
        </p>
        {/* The receipt. Every claim Pulse makes shows its working. */}
        <p className="mt-1 text-xs text-emerald-500/80">{formatEvidence(me.evidence)}</p>
        <p className="mt-2 text-xs text-zinc-600">
          last seen {relativeTime(new Date(me.lastSeenAt))}
        </p>
      </div>

      <p className="mt-4 text-sm text-zinc-400">
        Nobody typed any of that in. Sign in and Pulse keeps it current.
      </p>

      <Link
        href="/signin"
        className="mt-4 inline-flex min-h-11 items-center rounded bg-emerald-500 px-4 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-400"
      >
        Sign in — and Pulse keeps it current
      </Link>

      {rest.length > 0 && (
        <p className="mt-6 text-xs text-zinc-600">
          {rest.length} other {rest.length === 1 ? 'person' : 'people'} shipped this week too.
        </p>
      )}
    </section>
  );
}

/**
 * The common case, by design — about 58 of 65 people on any given day.
 *
 * The spec makes this first-class rather than an edge case: don't pretend to know them,
 * make the ignorance the invitation. The number is true, and it's the motivating fact.
 */
function Unknown({
  handle,
  shipped,
  onBack,
}: {
  handle: string;
  shipped: PublicMember[];
  onBack: () => void;
}) {
  return (
    <section>
      {/* Built as one string rather than JSX text around an expression: interpolating
          next to text let the separating space get eaten, and it rendered "8people". */}
      <h1 className="text-2xl font-medium tracking-tight text-zinc-100">
        {`${shipped.length} ${shipped.length === 1 ? 'person has' : 'people have'} shipped this week. You’re not one of them yet.`}
      </h1>
      <p className="mt-3 text-sm text-zinc-400">
        Pulse read the cohort&rsquo;s public repo and couldn&rsquo;t find anything from @{handle}. That
        isn&rsquo;t a judgement — it just means there&rsquo;s nothing public yet.
      </p>

      <Link
        href="/signin"
        className="mt-5 inline-flex min-h-11 items-center rounded bg-emerald-500 px-4 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-400"
      >
        Sign in with GitHub — Pulse will find your work
      </Link>

      <button onClick={onBack} className="ml-3 text-xs text-zinc-500 hover:text-zinc-300">
        try another handle
      </button>
    </section>
  );
}

function Degraded({ snapshot }: { snapshot: CohortSnapshot }) {
  const reset = snapshot.degraded?.resetAt
    ? new Date(snapshot.degraded.resetAt).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight text-zinc-100">
        Pulse can&rsquo;t read GitHub right now.
      </h1>
      {/* Degrade loudly. A stale feed presented as live is the exact lie every other
          board tells — the one this product exists to avoid. */}
      <p className="mt-3 text-sm text-zinc-400">
        {snapshot.degraded?.kind === 'rate_limited'
          ? `GitHub is rate-limiting us${reset ? `. Back at ${reset}.` : '.'}`
          : 'GitHub is unreachable from here.'}{' '}
        So this page can&rsquo;t show you the cohort&rsquo;s week — rather than show you a stale one and
        call it live.
      </p>
      <Link
        href="/signin"
        className="mt-5 inline-flex min-h-11 items-center rounded border border-zinc-800 px-4 text-sm text-zinc-300 transition-colors hover:border-zinc-600"
      >
        Sign in anyway — the board works
      </Link>
    </section>
  );
}

/* ------------------------------------------------------------------ cohort */

function Cohort({
  shipped,
  enrolled,
  fetchedAt,
}: {
  shipped: PublicMember[];
  enrolled: number;
  fetchedAt: string;
}) {
  if (shipped.length === 0) return null;

  return (
    <section className="mt-12 border-t border-zinc-800 pt-6">
      <h2 className="text-xs text-zinc-500">
        The cohort so far · {shipped.length} of {enrolled}
      </h2>

      <ul className="mt-3 space-y-1">
        {shipped.map((m) => (
          <li key={m.handle} className="flex items-baseline gap-3 py-1.5">
            <span className="text-sm text-zinc-100">@{m.handle}</span>
            {/* Facts. No narrative, no rank, no score — and nothing at all about the
                people who haven't pushed. Pulse never shows the cohort who is quiet. */}
            <span className="text-xs text-zinc-500">{formatEvidence(m.evidence)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-zinc-600">
        Read from the cohort&rsquo;s public GitHub repo, {relativeTime(new Date(fetchedAt))}. Nothing
        here was typed in, and nothing here is invented.
      </p>
    </section>
  );
}

/**
 * Required on this page by spec §5.0 — small, plain, always visible.
 *
 * ⚠️ The non-commercial line is a statement of intent, NOT consent. What actually protects
 * people is the facts-only default, the opt-in gate on narration, and a working opt-out.
 * The disclaimer must never become the substitute for those.
 */
function Disclosure() {
  return (
    <footer className="mt-12 border-t border-zinc-800 pt-6">
      <p className="text-xs leading-relaxed text-zinc-600">
        Pulse reads public activity from the cohort&rsquo;s GitHub repo to show the cohort&rsquo;s work.
        Facts only — AI summaries about a person appear only if they&rsquo;ve connected their own
        account. Built for the Hult Cohort Developer Program, <strong>non-commercial, for cohort use
        only</strong>. Not you?{' '}
        <Link href="/opt-out" className="text-zinc-400 underline underline-offset-2 hover:text-zinc-200">
          Remove me
        </Link>
        .
      </p>
    </footer>
  );
}
