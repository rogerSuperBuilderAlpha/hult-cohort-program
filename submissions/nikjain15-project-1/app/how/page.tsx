import Link from 'next/link';
import type { Metadata } from 'next';
import { byActivity, ENROLLED, type CohortSnapshot } from '@/lib/cohort';
import { removeOptedOut } from '@/lib/opt-out';
import { buildCohortSnapshot, participantsOnly } from '@/lib/pre-index';
import { formatEvidence, relativeTime } from '@/lib/sense';

/**
 * `/how` — the walkthrough. Public, signed out, no auth gate.
 *
 * Built to be presented: someone opens this on a screen and talks through what Pulse does,
 * with the cohort's real week rendered live at the bottom. Same server-fetched snapshot the
 * landing uses, so the numbers here are the numbers there — read from the public repo, never
 * invented. Facts only; nothing on this page narrates anyone.
 *
 * DESIGN-SPEC §4: sentence case, 11–14px, two weights, hairline borders. Green is the
 * motivating action and nothing else is coloured — so the only green here is the brand mark
 * and the one sign-in button, exactly as the landing does it.
 */
export const metadata: Metadata = {
  title: 'How Pulse works',
  description: 'The board that updates itself — how Pulse senses the cohort, one layer at a time.',
};

// Same 15-minute cache as the landing: a presenter reloading this doesn't spend GitHub's limit.
export const revalidate = 900;

export default async function HowPage() {
  const snapshot = await visibleCohort(await buildCohortSnapshot());
  const shipped = byActivity(snapshot.members);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-20">
      <header className="mb-12">
        <Link href="/" className="flex w-fit items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
          <span className="text-sm font-medium text-zinc-100">Pulse</span>
        </Link>
        <h1 className="mt-6 text-2xl font-medium tracking-tight text-zinc-100">
          The board that updates itself. Here&rsquo;s how.
        </h1>
        <p className="mt-3 text-sm text-zinc-300">
          Do the work — Pulse spots it, moves your card, and tells your team. This page walks the
          whole path, and shows the cohort&rsquo;s real week at the end.
        </p>
      </header>

      {/* -------------------------------------------------- the problem */}
      <section className="border-t border-zinc-800 pt-6">
        <h2 className="text-xs text-zinc-400">The problem</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-200">
          Every task board dies the same way: updating it is manual, boring, and the first thing to
          go. But this cohort&rsquo;s work is already legible — dozens of people running coding agents
          against public repos. The status is already out there. Nobody should be typing it in.
        </p>
      </section>

      {/* -------------------------------------------------- three layers */}
      <section className="mt-12 border-t border-zinc-800 pt-6">
        <h2 className="text-xs text-zinc-400">How it works · three layers</h2>
        <p className="mt-3 text-sm text-zinc-300">
          Remove the model and there&rsquo;s no product left. That&rsquo;s the test Pulse is built to pass —
          and why a chat box in the corner was rejected.
        </p>
        <ol className="mt-6 space-y-3">
          <Layer
            step="1"
            name="Sense"
            status="Shipped"
            body="Pulse reads your commits and PRs, and writes your week in plain English."
          />
          <Layer
            step="2"
            name="Bank"
            status="Designed"
            body="Pulse pulls how a problem got solved from the session that solved it, and keeps it."
          />
          <Layer
            step="3"
            name="Broker"
            status="Designed"
            body="Pulse spots who's stuck on what someone already solved, and makes the introduction."
          />
        </ol>
      </section>

      {/* -------------------------------------------------- the flow */}
      <section className="mt-12 border-t border-zinc-800 pt-6">
        <h2 className="text-xs text-zinc-400">What happens on every load</h2>
        <ol className="mt-5 space-y-4">
          <Flow
            tag="Source"
            title="The public cohort repo"
            body="Everyone opens PRs against one repo. The status is already public record."
          />
          <Flow
            tag="Server · no login, no model, no database"
            title="Pulse reads the pull requests"
            body="One call, grouped by author, turned into facts. This step decides what Pulse asserts about a person, so it&rsquo;s a pure function with nothing else in the path — and it&rsquo;s tested that way."
          />
          <Flow
            tag="Snapshot"
            title={`${shipped.length} recognised of ${ENROLLED} enrolled, 0 invented`}
            body="Most people haven&rsquo;t pushed yet, and Pulse says so rather than inventing rows to look busy. The gap is the honest part."
          />
          <Flow
            tag="Two screens"
            title="Signed out shows the cohort · signed in shows you"
            body="Signed out, this snapshot renders for a stranger before any account. Signed in, your board narrates your own week — and only with your consent."
            last
          />
        </ol>
      </section>

      {/* -------------------------------------------------- consent */}
      <section className="mt-12 border-t border-zinc-800 pt-6">
        <h2 className="text-xs text-zinc-400">The line Pulse won&rsquo;t cross</h2>
        <p className="mt-3 text-sm text-zinc-300">
          A model writes a sentence <em>as</em> a person only when all three hold. It&rsquo;s off for
          everyone who hasn&rsquo;t connected their own account.
        </p>
        <ul className="mt-5 space-y-3">
          <Gate name="You opted in" body="A sentence about you needs your yes. Nothing else unlocks it." />
          <Gate name="You linked GitHub" body="No connected account, nothing to attribute a sentence to." />
          <Gate
            name="You didn't pick ask-first"
            body="Ask-first holds every sentence for your approval before it posts. Nothing goes out under your name until you say so."
          />
        </ul>
      </section>

      {/* -------------------------------------------------- live data */}
      {shipped.length > 0 && (
        <section className="mt-12 border-t border-zinc-800 pt-6">
          <h2 className="text-xs text-zinc-400">
            The cohort so far · {shipped.length} of {ENROLLED}
          </h2>
          <p className="mt-3 text-sm text-zinc-300">Read live from the public repo as you loaded this.</p>
          <ul className="mt-4 space-y-1">
            {shipped.map((m) => (
              <li key={m.handle} className="flex items-baseline gap-3 py-1.5">
                <span className="text-sm text-zinc-100">@{m.handle}</span>
                <span className="text-xs text-zinc-400">{formatEvidence(m.evidence)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-zinc-400">
            Read from the cohort&rsquo;s public GitHub repo, {relativeTime(new Date(snapshot.fetchedAt))}.
            Nothing here was typed in, and nothing here is invented.
          </p>
        </section>
      )}

      {snapshot.degraded && (
        <section className="mt-12 border-t border-zinc-800 pt-6">
          <p className="text-sm text-zinc-400">
            Pulse can&rsquo;t read GitHub right now, so the cohort&rsquo;s week isn&rsquo;t here — rather than show a
            stale one and call it live. The walkthrough above still holds.
          </p>
        </section>
      )}

      {/* -------------------------------------------------- see it live */}
      <section className="mt-12 border-t border-zinc-800 pt-6">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded border border-zinc-800 px-4 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
          >
            See the cohort&rsquo;s week
          </Link>
          <Link
            href="/signin"
            className="inline-flex min-h-11 items-center rounded bg-emerald-500 px-4 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-400"
          >
            Sign in — yours is waiting
          </Link>
        </div>
      </section>

      <footer className="mt-12 border-t border-zinc-800 pt-6">
        <p className="text-xs leading-relaxed text-zinc-400">
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
    </main>
  );
}

/* ------------------------------------------------------------------ pieces */

/**
 * One layer. The status is a fact, not a colour — "Shipped" and "Designed" both read in the
 * same zinc, because green on this page is reserved for the one motivating action (sign in).
 */
function Layer({
  step,
  name,
  body,
  status,
}: {
  step: string;
  name: string;
  body: string;
  status: string;
}) {
  return (
    <li className="flex gap-4 rounded-lg border border-zinc-800 p-4">
      <span className="mt-0.5 text-xs text-zinc-500 tabular-nums" aria-hidden>
        {step}
      </span>
      <div className="flex-1">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-medium text-zinc-100">{name}</span>
          <span className="text-xs text-zinc-500">{status}</span>
        </div>
        <p className="mt-1 text-sm text-zinc-400">{body}</p>
      </div>
    </li>
  );
}

/**
 * One step of the load path. A plain zinc rule down the left ties the steps together —
 * hairline only, nothing coloured.
 */
function Flow({
  tag,
  title,
  body,
  last,
}: {
  tag: string;
  title: string;
  body: string;
  last?: boolean;
}) {
  return (
    <li className="relative pl-5">
      <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full border border-zinc-600" aria-hidden />
      {!last && <span className="absolute left-[3.5px] top-4 bottom-[-1rem] w-px bg-zinc-800" aria-hidden />}
      <p className="text-xs text-zinc-500">{tag}</p>
      <p className="mt-1 text-sm font-medium text-zinc-100">{title}</p>
      <p className="mt-1 text-sm text-zinc-400">{body}</p>
    </li>
  );
}

function Gate({ name, body }: { name: string; body: string }) {
  return (
    <li className="rounded-lg border border-zinc-800 p-4">
      <p className="text-sm font-medium text-zinc-100">{name}</p>
      <p className="mt-1 text-sm text-zinc-400">{body}</p>
    </li>
  );
}

/**
 * The cohort, minus anyone who asked to be removed. Fails closed, exactly as `/` does: if the
 * opt-out list is unreadable we show nothing rather than risk displaying someone who opted out.
 */
async function visibleCohort(snapshot: CohortSnapshot): Promise<CohortSnapshot> {
  try {
    return { ...snapshot, members: await removeOptedOut(participantsOnly(snapshot.members)) };
  } catch {
    return { ...snapshot, members: [], degraded: { kind: 'unreachable', resetAt: null } };
  }
}
