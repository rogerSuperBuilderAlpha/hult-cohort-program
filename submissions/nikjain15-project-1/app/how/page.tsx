import Link from 'next/link';
import type { Metadata } from 'next';
import { byActivity, ENROLLED, type CohortSnapshot, type PublicMember } from '@/lib/cohort';
import { removeOptedOut } from '@/lib/opt-out';
import { buildCohortSnapshot, participantsOnly } from '@/lib/pre-index';
import { formatEvidence, relativeTime } from '@/lib/sense';

/**
 * `/how` — the walkthrough. Public, signed out, no auth gate.
 *
 * Built to be presented: someone opens this and walks through what Pulse does, with the
 * cohort's real week rendered live at the bottom. Same server-fetched snapshot the landing
 * uses, so the numbers here are the numbers there — read from the public repo, never invented.
 *
 * DESIGN-SPEC §4: sentence case, 11–14px, two weights, hairline borders, cards on zinc-900.
 * Colour carries meaning — green is the one motivating action (sign in), so every bar and
 * marker here is zinc. Emphasis is weight, not hue.
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
      <header className="mb-14">
        <Link href="/" className="flex w-fit items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
          <span className="text-sm font-medium text-zinc-100">Pulse</span>
        </Link>
        <h1 className="mt-6 text-2xl font-medium tracking-tight text-zinc-100">
          The board that updates itself. Here&rsquo;s how.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          Do the work — Pulse spots it, moves your card, and tells your team. This page walks the
          whole path, and shows the cohort&rsquo;s real week at the end.
        </p>
        <p className="mt-4 text-sm text-zinc-400">
          Want how it&rsquo;s built?{' '}
          <Link href="/approach" className="text-zinc-300 underline underline-offset-2 hover:text-zinc-100">
            Read the architecture
          </Link>
          .
        </p>
      </header>

      {/* -------------------------------------------------- the problem */}
      <Band label="The problem">
        <p className="text-sm leading-relaxed text-zinc-200">
          Every task board dies the same way: updating it is manual, boring, and the first thing to
          go. But this cohort&rsquo;s work is already legible — dozens of people running coding agents
          against public repos. The status is already out there. Nobody should be typing it in.
        </p>
      </Band>

      {/* -------------------------------------------------- three layers */}
      <Band label="How it works · three layers">
        <p className="mb-5 text-sm leading-relaxed text-zinc-300">
          Remove the model and there&rsquo;s no product left. That&rsquo;s the test Pulse is built to pass —
          and why a chat box in the corner was rejected.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <LayerCard n="1" name="Sense" status="Shipped" done>
            Reads your commits and PRs, and writes your week in plain English.
          </LayerCard>
          <LayerCard n="2" name="Bank" status="Designed">
            Pulls how a problem got solved from the session that solved it.
          </LayerCard>
          <LayerCard n="3" name="Broker" status="Designed">
            Spots who&rsquo;s stuck on what someone already solved, and introduces them.
          </LayerCard>
        </div>
      </Band>

      {/* -------------------------------------------------- the flow */}
      <Band label="What happens on every load">
        <div className="relative">
          {/* the spine */}
          <span className="absolute left-[15px] top-3 bottom-10 w-px bg-zinc-800" aria-hidden />
          <div className="space-y-3">
            <FlowNode tag="Source" title="The public cohort repo">
              Everyone opens PRs against one repo. The status is already public record.
            </FlowNode>
            <FlowNode tag="Server · no login, no model, no database" title="Pulse reads the pull requests">
              One call, grouped by author, turned into facts. This step decides what Pulse asserts
              about a person, so it&rsquo;s a pure function with nothing else in the path.
            </FlowNode>
            <FlowNode tag="Snapshot" title={`${shipped.length} recognised of ${ENROLLED} enrolled, 0 invented`}>
              Most people haven&rsquo;t pushed yet, and Pulse says so rather than inventing rows to look
              busy. The gap is the honest part.
            </FlowNode>
          </div>
          {/* the branch into two screens */}
          <div className="mt-3 grid gap-3 pl-8 sm:grid-cols-2">
            <BranchCard k="Signed out" title="The cohort">
              This snapshot renders for a stranger before any account.
            </BranchCard>
            <BranchCard k="Signed in" title="Your board">
              Your own week, narrated only with your consent.
            </BranchCard>
          </div>
        </div>
      </Band>

      {/* -------------------------------------------------- consent */}
      <Band label="The line Pulse won’t cross">
        <p className="mb-5 text-sm leading-relaxed text-zinc-300">
          A model writes a sentence <em>as</em> a person only when all three hold. It&rsquo;s off for
          everyone who hasn&rsquo;t connected their own account.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <GateCard n="1" name="You opted in">A sentence about you needs your yes. Nothing else unlocks it.</GateCard>
          <GateCard n="2" name="You linked GitHub">No connected account, nothing to attribute a sentence to.</GateCard>
          <GateCard n="3" name="Not ask-first">Ask-first holds every sentence for your approval before it posts.</GateCard>
        </div>
      </Band>

      {/* -------------------------------------------------- live data */}
      {shipped.length > 0 && (
        <Band label={`The cohort so far · ${shipped.length} of ${ENROLLED}`}>
          <CohortMeter shipped={shipped.length} enrolled={ENROLLED} />
          <ul className="mt-6 space-y-2.5">
            {shipped.map((m) => (
              <MemberRow key={m.handle} member={m} max={maxPrs(shipped)} />
            ))}
          </ul>
          <p className="mt-5 text-xs text-zinc-400">
            Read from the cohort&rsquo;s public GitHub repo, {relativeTime(new Date(snapshot.fetchedAt))}.
            Nothing here was typed in, and nothing here is invented.
          </p>
        </Band>
      )}

      {snapshot.degraded && (
        <Band label="The cohort so far">
          <p className="text-sm text-zinc-400">
            Pulse can&rsquo;t read GitHub right now, so the cohort&rsquo;s week isn&rsquo;t here — rather than show a
            stale one and call it live. The walkthrough above still holds.
          </p>
        </Band>
      )}

      {/* -------------------------------------------------- see it live */}
      <div className="mt-12 flex flex-wrap gap-3 border-t border-zinc-800 pt-8">
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

/* ------------------------------------------------------------------ layout */

/** A titled band: a small zinc label, a hairline top rule, and its content. */
function Band({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 border-t border-zinc-800 pt-6 first:mt-0 first:border-0 first:pt-0">
      <h2 className="mb-4 text-xs text-zinc-400">{label}</h2>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ layers */

function LayerCard({
  n,
  name,
  status,
  done,
  children,
}: {
  n: string;
  name: string;
  status: string;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-medium tabular-nums text-zinc-100">{n}</span>
        <span className="text-xs text-zinc-500">{status}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-zinc-100">{name}</p>
      <p className="mt-1 text-sm leading-relaxed text-zinc-400">{children}</p>
      {/* a hairline progress cue: filled for shipped, a thin track for designed */}
      <div className="mt-3 h-px w-full bg-zinc-800">
        <div className={`h-px ${done ? 'w-full bg-zinc-500' : 'w-1/3 bg-zinc-700'}`} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ flow */

function FlowNode({ tag, title, children }: { tag: string; title: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-8">
      <span className="absolute left-[11px] top-1.5 h-2 w-2 rounded-full border border-zinc-500 bg-zinc-950" aria-hidden />
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-xs text-zinc-500">{tag}</p>
        <p className="mt-1 text-sm font-medium text-zinc-100">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">{children}</p>
      </div>
    </div>
  );
}

function BranchCard({ k, title, children }: { k: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-500">{k}</p>
      <p className="mt-1 text-sm font-medium text-zinc-100">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-zinc-400">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ consent */

function GateCard({ n, name, children }: { n: string; name: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 text-xs tabular-nums text-zinc-400">
        {n}
      </div>
      <p className="mt-3 text-sm font-medium text-zinc-100">{name}</p>
      <p className="mt-1 text-sm leading-relaxed text-zinc-400">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ cohort viz */

/**
 * The honesty thesis, drawn: one cell per enrolled member, the ones who've shipped filled in
 * a lighter zinc. The unfilled majority is the whole point — most haven't pushed yet, and Pulse
 * doesn't hide that. Zinc only; a filled cell is a fact, not an action.
 */
function CohortMeter({ shipped, enrolled }: { shipped: number; enrolled: number }) {
  return (
    <div>
      <div className="flex flex-wrap gap-1" role="img" aria-label={`${shipped} of ${enrolled} enrolled have shipped`}>
        {Array.from({ length: enrolled }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-[2px] ${i < shipped ? 'bg-zinc-400' : 'bg-zinc-800'}`}
          />
        ))}
      </div>
      <p className="mt-3 text-sm text-zinc-300">
        <span className="text-zinc-100">{shipped} shipped</span>
        {` · ${enrolled - shipped} haven’t pushed yet · ${enrolled} enrolled`}
      </p>
    </div>
  );
}

/** One member: handle, a zinc bar for how many PRs, and the human evidence line. */
function MemberRow({ member, max }: { member: PublicMember; max: number }) {
  const prs = member.evidence.prNumbers.length;
  return (
    <li className="flex items-center gap-3">
      <span className="w-40 shrink-0 truncate text-sm text-zinc-100">@{member.handle}</span>
      <span className="h-1.5 w-16 shrink-0 rounded-full bg-zinc-800" aria-hidden>
        <span
          className="block h-1.5 rounded-full bg-zinc-500"
          style={{ width: `${Math.max(12, Math.round((prs / max) * 100))}%` }}
        />
      </span>
      <span className="truncate text-xs text-zinc-400">{formatEvidence(member.evidence)}</span>
    </li>
  );
}

function maxPrs(members: PublicMember[]): number {
  return Math.max(1, ...members.map((m) => m.evidence.prNumbers.length));
}

/* ------------------------------------------------------------------ data */

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
