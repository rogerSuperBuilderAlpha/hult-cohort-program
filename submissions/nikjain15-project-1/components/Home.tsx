'use client';

import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Avatar } from '@/components/TaskCard';
import { Button, ErrorNote } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { subscribeToLink } from '@/lib/github-link';
import { subscribeToPulse, toggleKudos } from '@/lib/pulse';
import { formatEvidence, relativeTime, selectAsk, type Ask, type AskContext } from '@/lib/sense';
import type { GitHubLink, Member, PulseEvent, Task } from '@/lib/types';
import { useCohort } from '@/lib/use-cohort';

/**
 * Home — `/` signed in. DESIGN-SPEC §6.
 *
 * Three regions, in order: your posted row (a receipt, never a form), exactly one standing
 * ask, and the cohort's week (pulse strip + live feed).
 *
 * The rules this screen exists to keep, and which no future edit may relax:
 * - **No leaderboard, no rank, no score.** Kudos are recognition. Counting them into an
 *   order is the one thing this product refuses to do.
 * - **Never punish the quiet** (§6.2). Pulse knows who hasn't pushed; the cohort sees
 *   nothing about it. No streaks, no "N days inactive", no absence counts. When in doubt,
 *   say nothing.
 * - **Never fake data** (§6.3). An empty feed says it's empty.
 * - **Never `dangerouslySetInnerHTML`.** `narrative` is model-written from commit text an
 *   attacker controls. React escapes by default; opting out is how that becomes an exploit.
 */
export function Home() {
  // Every hook lives in the child. AppShell is the auth gate, so `user!` is only safe
  // below it — reading it in this component crashes at prerender, before auth resolves.
  return (
    <AppShell>
      <HomeView />
    </AppShell>
  );
}

/* --------------------------------------------------------------------- motion */

/**
 * New rows fade; kudos scales once. Nothing else animates (§4).
 *
 * Written as a stylesheet rather than a utility class because the keyframe has to sit
 * inside `prefers-reduced-motion: no-preference` — motion here is an enhancement, and a
 * reader who asked for stillness gets stillness.
 */
const MOTION_CSS = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes pulse-row-in { from { opacity: 0 } to { opacity: 1 } }
  .pulse-row-in { animation: pulse-row-in 200ms ease-out }
}`;

/* ----------------------------------------------------------------------- view */

function HomeView() {
  const { user } = useAuth();
  const uid = user!.uid;

  const { tasks, projects, members, ready } = useCohort();
  const { events, fresh, ready: feedReady } = usePulseFeed();
  const [link, setLink] = useState<GitHubLink | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeToLink(uid, setLink), [uid]);

  // The newest thing Pulse said *in your voice*, if it said one today. Facts-only events
  // (narrative: null) are not receipts — there is no model sentence to stand behind.
  const posted = useMemo(() => findPostedRow(events, uid), [events, uid]);

  const ask = useMemo(
    () => selectAsk(buildAskContext({ uid, tasks, projects, ready })),
    [uid, tasks, projects, ready]
  );

  return (
    <>
      <style>{MOTION_CSS}</style>

      {/* Narratives are prose. Past ~68ch they get harder to read, so extra width becomes
          margin and never a second column (§4). Centred from 1440. */}
      <div className="w-full max-w-[68ch] min-[1440px]:mx-auto">
        <ErrorNote>{error}</ErrorNote>

        {posted ? (
          <PostedRow event={posted} onError={setError} />
        ) : (
          // Only the person who declined gets told there's nothing of theirs — everyone
          // else's silence is nobody's business, including their own dashboard's.
          link?.status === 'declined' && <NothingOfYours />
        )}

        <StandingAsk ask={ask} uid={uid} ready={ready} />

        <CohortWeek
          events={events}
          fresh={fresh}
          members={members}
          ready={feedReady}
          uid={uid}
          onError={setError}
        />
      </div>
    </>
  );
}

/* ----------------------------------------------------------------------- feed */

/**
 * The live feed, plus which rows arrived while you were watching.
 *
 * Realtime or it didn't happen (§principle 9): one `onSnapshot`, 50 events, newest first.
 * The first snapshot is *not* new — animating a page you just opened is noise, not news.
 */
function usePulseFeed() {
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [ready, setReady] = useState(false);
  const [fresh, setFresh] = useState<ReadonlySet<string>>(new Set());
  const seen = useRef<Set<string> | null>(null);

  useEffect(
    () =>
      subscribeToPulse((next) => {
        setEvents(next);
        setReady(true);

        if (seen.current === null) {
          seen.current = new Set(next.map((e) => e.id));
          return;
        }

        const added = next.filter((e) => !seen.current!.has(e.id)).map((e) => e.id);
        if (added.length === 0) return;
        added.forEach((id) => seen.current!.add(id));
        setFresh(new Set(added));
      }, 50),
    []
  );

  return { events, fresh, ready };
}

/* ------------------------------------------------------- 1 · your posted row */

const POSTED_ROW_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Your most recent narrated event, if it's recent enough to still be "this".
 *
 * A receipt from last week isn't a receipt, it's history — it belongs in the feed, where
 * it already is. Nothing is invented to fill this slot: sensing isn't wired yet, so today
 * this returns null for everyone and the region renders nothing at all.
 */
function findPostedRow(events: PulseEvent[], uid: string): PulseEvent | null {
  const now = Date.now();
  return (
    events.find(
      (e) =>
        e.actorUid === uid &&
        !!e.narrative &&
        now - e.createdAt.toDate().getTime() < POSTED_ROW_MAX_AGE_MS
    ) ?? null
  );
}

/**
 * The receipt. **Not a form** — `logPulse` already fired at sync, so there is nothing here
 * to approve. A confirmation step is still an update step, and nobody updates Pulse (§3.1).
 *
 * Being wrong has to be cheaper than approving would have been (§6.1): the wording is one
 * click from the post itself, undo removes it from every feed, and the evidence is on
 * screen so a mistake is legible rather than mysterious. Pulse never argues — no "are you
 * sure?". The human is right.
 */
function PostedRow({ event, onError }: { event: PulseEvent; onError: (m: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(event.narrative ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    onError(null);
    try {
      // The rules let the actor write `narrative` and `editedAt` and nothing else — one
      // extra key here and the whole update is denied.
      await updateDoc(doc(db, 'pulse', event.id), {
        narrative: draft.trim() || null,
        editedAt: serverTimestamp(),
      });
      setEditing(false);
    } catch {
      onError("We couldn't save your wording. The post is unchanged.");
    } finally {
      setSaving(false);
    }
  };

  const undo = async () => {
    onError(null);
    try {
      await deleteDoc(doc(db, 'pulse', event.id));
    } catch {
      onError("We couldn't undo that post. It's still up — try again.");
    }
  };

  return (
    <section className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-500">
        pulse posted this · {relativeTime(event.createdAt.toDate())}
        {event.editedAt && ' · you reworded it'}
      </p>

      {editing ? (
        <div className="mt-2">
          <label htmlFor="posted-wording" className="mb-1 block text-xs text-zinc-500">
            Your wording
          </label>
          <textarea
            id="posted-wording"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full resize-y rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
          />
          <p className="mt-1 text-xs text-zinc-600">
            Leave it empty to keep the post as facts only.
          </p>
          <div className="mt-2 flex gap-2">
            <Button variant="primary" disabled={saving} onClick={() => void save()}>
              Save my wording
            </Button>
            <Button
              onClick={() => {
                setDraft(event.narrative ?? '');
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Plain text. `narrative` came from a model reading commit messages a stranger
              wrote — it is rendered escaped, always. */}
          <h1 className="mt-1 text-base text-zinc-100">{event.narrative}</h1>

          {event.evidence && (
            <p className="mt-1 text-xs text-emerald-500/80">
              {formatEvidence(event.evidence)}
              <FileList files={event.evidence.files} />
            </p>
          )}

          <div className="mt-3 flex items-center gap-4">
            <Kudos count={event.kudos.length} own />
            {/* Quiet on purpose: correcting is the exception, not the workflow. */}
            <button
              onClick={() => {
                setDraft(event.narrative ?? '');
                setEditing(true);
              }}
              className="min-h-11 text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-300"
            >
              edit the wording
            </button>
            <button
              onClick={() => void undo()}
              className="min-h-11 text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-300"
            >
              undo
            </button>
          </div>
        </>
      )}
    </section>
  );
}

/**
 * §6.3 — the one empty state Home has. Shown only to someone who declined GitHub, because
 * only they are missing something they could choose to have.
 *
 * The cohort's real week still renders below it: the honest thing is that other people
 * shipped, not that nothing happened.
 */
function NothingOfYours() {
  return (
    <section className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h1 className="text-base text-zinc-100">Nothing of yours here yet.</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Pulse isn&rsquo;t reading your GitHub, so it has nothing to post as you. The board works
        either way.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/connect"
          className="inline-flex min-h-11 items-center rounded bg-emerald-500 px-3 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-400"
        >
          Connect GitHub
        </Link>
        <Link
          href="/board"
          className="inline-flex min-h-11 items-center rounded border border-zinc-800 px-3 text-sm text-zinc-300 transition-colors hover:border-zinc-600"
        >
          Add a task myself
        </Link>
      </div>
    </section>
  );
}

/* -------------------------------------------------- 2 · the standing ask */

/**
 * Build the ladder's input from what actually exists today.
 *
 * `brokerMatch` and `weakMatch` are **null and hard-coded null**: layer 3 (Broker) is
 * designed, not built, so there is no match to offer. Filling them with a plausible
 * stand-in would fabricate a person being stuck — the single most dishonest thing this
 * screen could do. Rungs 1 and 2 cannot fire until Broker ships and populates them.
 *
 * That leaves rungs 3, 4 and 5 live today.
 */
function buildAskContext({
  uid,
  tasks,
  projects,
  ready,
}: {
  uid: string;
  tasks: Task[];
  projects: { id: string; archived: boolean }[];
  ready: boolean;
}): AskContext {
  const empty: AskContext = {
    brokerMatch: null,
    weakMatch: null,
    unclaimedTask: null,
    oldestInProgress: null,
  };

  // Before the listeners settle everything looks unclaimed-free and in-progress-free.
  // Asking "nothing needs you" during a loading frame would be a lie that flickers.
  if (!ready) return empty;

  // Archived projects' work isn't work anybody should be asked to pick up.
  const live = new Set(projects.filter((p) => !p.archived).map((p) => p.id));
  const visible = tasks.filter((t) => live.has(t.projectId));

  const oldestFirst = (a: Task, b: Task) =>
    (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0);

  const unclaimed = visible
    .filter((t) => t.assigneeUid === null && t.status !== 'done')
    .sort(oldestFirst)[0];

  const mine = visible
    .filter((t) => t.assigneeUid === uid && t.status === 'in_progress')
    .sort(oldestFirst)[0];

  return {
    ...empty,
    unclaimedTask: unclaimed ? { id: unclaimed.id, title: unclaimed.title } : null,
    oldestInProgress: mine ? { id: mine.id, title: mine.title } : null,
  };
}

/**
 * Exactly one ask. Ever.
 *
 * `selectAsk` returns a single `Ask`, and this renders that one — there is deliberately no
 * path here that renders two. Two asks is a backlog, and a backlog is what this product
 * deleted.
 */
function StandingAsk({ ask, uid, ready }: { ask: Ask; uid: string; ready: boolean }) {
  if (!ready) {
    return (
      <section className="mb-8 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-sm text-zinc-500">Looking for the one thing that needs you…</p>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <AskBody ask={ask} uid={uid} />
    </section>
  );
}

function AskBody({ ask, uid }: { ask: Ask; uid: string }) {
  switch (ask.kind) {
    // Rungs 1 and 2 are unreachable today — Broker isn't built. They render correctly the
    // day it starts populating brokerMatch/weakMatch, and not a moment before.
    case 'broker':
      return (
        <AskCard
          headline={`${ask.helperName} is stuck on something you solved`}
          detail={ask.problem}
          cta={{ label: 'Send them what worked', href: '/recipes' }}
        />
      );
    case 'weak_match':
      return (
        <AskCard
          headline="Someone’s stuck on something you probably know"
          detail={ask.problem}
          cta={{ label: 'Take a look', href: '/recipes' }}
        />
      );
    case 'unclaimed':
      return (
        <AskCard
          headline="Nobody’s on this"
          detail={ask.title}
          cta={{ label: 'Pick it up', href: '/board?status=todo' }}
        />
      );
    case 'your_task':
      return (
        <AskCard
          headline="Your oldest open one"
          detail={ask.title}
          cta={{ label: 'Open the board', href: `/board?assignee=${uid}&status=in_progress` }}
        />
      );
    case 'nothing':
      // The honest floor. It has to read as permission, not as a dead end — inventing an
      // ask to fill the space is how a tool starts lying to look busy, and telling someone
      // they're idle is how it starts punishing the quiet.
      return (
        <>
          <h2 className="text-base text-zinc-100">Nothing needs you right now.</h2>
          <p className="mt-1 text-sm text-zinc-400">
            That&rsquo;s allowed. The cohort&rsquo;s week is below.
          </p>
        </>
      );
  }
}

function AskCard({
  headline,
  detail,
  cta,
}: {
  headline: string;
  detail: string;
  cta: { label: string; href: string };
}) {
  return (
    <>
      <h2 className="text-base text-zinc-100">{headline}</h2>
      <p className="mt-1 text-sm text-zinc-400">{detail}</p>
      {/* Green, because this is the motivating action — the only thing on Home that gets
          a colour besides debt. */}
      <Link
        href={cta.href}
        className="mt-3 inline-flex min-h-11 items-center rounded bg-emerald-500 px-3 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-400"
      >
        {cta.label}
      </Link>
    </>
  );
}

/* --------------------------------------------------- 3 · the cohort's week */

function CohortWeek({
  events,
  fresh,
  members,
  ready,
  uid,
  onError,
}: {
  events: PulseEvent[];
  fresh: ReadonlySet<string>;
  members: Member[];
  ready: boolean;
  uid: string;
  onError: (m: string | null) => void;
}) {
  const byUid = useMemo(() => new Map(members.map((m) => [m.uid, m])), [members]);

  return (
    <section>
      <h2 className="text-xs text-zinc-500">The cohort&rsquo;s week</h2>

      <PulseStrip events={events} />

      {!ready ? (
        <p className="mt-4 text-sm text-zinc-500">Loading the feed…</p>
      ) : events.length === 0 ? (
        // Never padded. An empty feed is a true statement about a young cohort, and the
        // honesty is worth more than a screenful of invented rows.
        <p className="mt-4 text-sm text-zinc-500">
          Nothing has happened yet. The first person to ship shows up here — live, without
          anybody typing it in.
        </p>
      ) : (
        <>
          <ul className="mt-2">
            {events.map((event) => (
              <FeedRow
                key={event.id}
                event={event}
                member={byUid.get(event.actorUid)}
                uid={uid}
                fresh={fresh.has(event.id)}
                onError={onError}
              />
            ))}
          </ul>

          {/* A stated limitation, not pagination. Pretending to have more is worse than
              admitting the cap. */}
          {events.length >= 50 && (
            <p className="border-t border-zinc-800 py-3 text-xs text-zinc-600">
              ⋯ older — Pulse keeps the last 50 events on this screen.
            </p>
          )}
        </>
      )}
    </section>
  );
}

/**
 * The pulse strip — 7 days, one bar per day, height = events, today marked.
 *
 * Derived from the feed already in memory: no second query, no aggregate doc, no cost.
 * This is why the product is called Pulse, and it's cohort-wide by construction — a bar is
 * the cohort's day, never a person's, so there is nothing here to be ranked by or shamed
 * with. A day with no events is a short bar and no comment.
 */
function PulseStrip({ events }: { events: PulseEvent[] }) {
  const days = useMemo(() => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);

    const buckets = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(midnight);
      date.setDate(date.getDate() - (6 - i));
      return { date, count: 0 };
    });

    for (const e of events) {
      const at = e.createdAt.toDate();
      at.setHours(0, 0, 0, 0);
      const daysAgo = Math.round((midnight.getTime() - at.getTime()) / 86_400_000);
      if (daysAgo >= 0 && daysAgo <= 6) buckets[6 - daysAgo].count += 1;
    }

    return buckets;
  }, [events]);

  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="mt-2">
      <div
        role="img"
        aria-label={`${total} ${total === 1 ? 'event' : 'events'} across the cohort in the last 7 days`}
        className="flex h-[34px] items-end gap-1"
      >
        {days.map((d, i) => {
          const today = i === days.length - 1;
          return (
            <div key={d.date.toISOString()} className="flex h-full flex-1 flex-col justify-end">
              <div
                // Zinc, not green: a bar isn't an action, and colour on Home means
                // something. Today is marked by weight, not by hue.
                className={`w-full rounded-[2px] ${today ? 'bg-zinc-500' : 'bg-zinc-700'}`}
                style={{ height: `${Math.max(2, Math.round((d.count / max) * 30))}px` }}
              />
              {today && <div className="mt-0.5 h-px w-full bg-zinc-500" />}
            </div>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-zinc-600">
        {total === 0
          ? 'no events in the last 7 days'
          : `${total} ${total === 1 ? 'event' : 'events'} · last 7 days · today on the right`}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ feed rows */

function FeedRow({
  event,
  member,
  uid,
  fresh,
  onError,
}: {
  event: PulseEvent;
  member: Member | undefined;
  uid: string;
  fresh: boolean;
  onError: (m: string | null) => void;
}) {
  const mine = event.actorUid === uid;
  const evidence = event.kind === 'task_shipped' ? event.evidence : null;

  return (
    <li
      // Only rows that arrived while you were watching fade in. The first snapshot is the
      // page, not news.
      className={`flex min-h-[44px] items-start gap-3 border-b border-zinc-800/70 py-3 ${
        fresh ? 'pulse-row-in' : ''
      }`}
    >
      {member ? (
        <Avatar member={member} />
      ) : (
        // A member doc we haven't got yet. The event denormalises the name at write time,
        // so the row still reads correctly — that's the point of denormalising it.
        <span
          aria-hidden
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-zinc-400"
        >
          {(event.actorName || '?').charAt(0).toUpperCase()}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-zinc-300">
          <RowCopy event={event} />
        </p>

        {evidence && (
          <p className="mt-0.5 text-xs text-emerald-500/70">
            {formatEvidence(evidence)}
            <FileList files={evidence.files} />
          </p>
        )}

        <p className="mt-0.5 text-xs text-zinc-600">{relativeTime(event.createdAt.toDate())}</p>
      </div>

      {mine ? (
        // Your own row: the count is there, the control isn't. You can't kudos yourself,
        // and a disabled-looking button you can press once is worse than none.
        <Kudos count={event.kudos.length} own />
      ) : (
        <Kudos
          count={event.kudos.length}
          given={event.kudos.includes(uid)}
          onToggle={async () => {
            onError(null);
            try {
              await toggleKudos(event.id, uid, event.kudos.includes(uid));
            } catch {
              onError("We couldn't record that kudos. Nothing changed.");
            }
          }}
        />
      )}
    </li>
  );
}

/**
 * Feed copy — §6's table, exactly.
 *
 * Every field here is escaped by React. `narrative` in particular is model output derived
 * from commit messages, which are attacker-controlled: `dangerouslySetInnerHTML` on this
 * string is a stored-XSS vector aimed at 64 people, and there is no version of it that's
 * worth a bit of formatting.
 */
function RowCopy({ event }: { event: PulseEvent }) {
  const actor = <strong className="font-medium text-zinc-100">{event.actorName}</strong>;
  const subject = <em className="not-italic text-zinc-100">{event.subject}</em>;

  switch (event.kind) {
    case 'task_shipped':
      // No narrative → facts only. Never a blank: the fact is true even when nothing
      // narrated it, and someone who declined narration still shipped something.
      return event.narrative ? (
        <>
          {actor} {event.narrative}
        </>
      ) : (
        <>
          {actor} shipped {subject}
        </>
      );
    case 'task_started':
      return (
        <>
          {actor} started {subject}
        </>
      );
    case 'project_created':
      return (
        <>
          {actor} created {subject}
        </>
      );
    case 'member_joined':
      return <>{actor} joined the cohort</>;
    case 'recipe_banked':
      return (
        <>
          {actor} banked {subject}
        </>
      );
    case 'intro_made':
      // §6 wants "{actor} unstuck {other} on {problem}". `PulseEvent` carries one subject
      // and no field for the second party, and Broker (which would write these) isn't
      // built — so the problem clause is dropped rather than guessed at. Adding the field
      // is part of layer 3's PR, not something to fake from here.
      return (
        <>
          {actor} unstuck {subject}
        </>
      );
  }
}

/** Filenames are the widest part of the evidence line — they return at 768 (§4). */
function FileList({ files }: { files: string[] }) {
  if (files.length === 0) return null;
  return (
    <span className="hidden min-[768px]:inline"> · {files.slice(0, 3).join(', ')}</span>
  );
}

/* ---------------------------------------------------------------------- kudos */

/**
 * Kudos — recognition, never a score.
 *
 * There is no sort by this, no total per member, no rank. Green because giving one is the
 * motivating action; grey until you do.
 */
function Kudos({
  count,
  given = false,
  own = false,
  onToggle,
}: {
  count: number;
  given?: boolean;
  own?: boolean;
  onToggle?: () => void;
}) {
  const [pop, setPop] = useState(false);

  const body = (
    <>
      <Heart filled={given} />
      <span className="tabular-nums">{count > 0 ? count : ''}</span>
      <span className="hidden min-[480px]:inline">kudos</span>
    </>
  );

  const shared =
    'flex min-h-11 shrink-0 items-center gap-1.5 text-xs motion-safe:transition-transform motion-safe:duration-200';

  if (own || !onToggle) {
    return (
      <span className={`${shared} text-zinc-600`} title="Your own — kudos come from other people">
        {body}
      </span>
    );
  }

  return (
    <button
      onClick={() => {
        setPop(true);
        setTimeout(() => setPop(false), 200);
        onToggle();
      }}
      aria-pressed={given}
      aria-label={given ? 'Remove your kudos' : 'Give kudos'}
      className={`${shared} ${given ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'} ${
        pop ? 'motion-safe:scale-110' : ''
      }`}
    >
      {body}
    </button>
  );
}

/** No emoji anywhere in this product — the icon is a glyph we control. */
function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      width="13"
      height="13"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M8 13.5S1.5 9.6 1.5 5.6A3.1 3.1 0 0 1 8 4a3.1 3.1 0 0 1 6.5 1.6c0 4-6.5 7.9-6.5 7.9Z" />
    </svg>
  );
}
