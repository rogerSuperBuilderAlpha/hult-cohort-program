'use client';

import { useEffect, useRef, useState } from 'react';
import { markSynced } from './github-link';
import { syncFromGitHub, type SyncOutcome } from './sync';
import type { GitHubLink, Member, Project, Task } from './types';

type Actor = { uid: string; name: string; photoURL: string | null };

/** Polling, not webhooks — a stated limitation. 15 min is the lag the product admits to. */
const POLL_MS = 15 * 60 * 1000;

/**
 * Run the sensing pipeline on sign-in, then every 15 minutes while the tab is open.
 *
 * The whole hook is best-effort by construction. If it never runs, or every run fails,
 * the board is still a working manual board — that's the first non-negotiable, and it's
 * why nothing here can throw and nothing here gates rendering.
 */
export function useSync(input: {
  actor: Actor | null;
  link: GitHubLink | null;
  tasks: Task[];
  projects: Project[];
  /** The cohort — checkNarrative needs it to reject a sentence naming anyone but you. */
  members: Member[];
  /** Listeners must have delivered first, or the dedupe runs against an empty board and twins everything. */
  ready: boolean;
}): SyncOutcome | null {
  const { actor, link, tasks, projects, members, ready } = input;
  const [outcome, setOutcome] = useState<SyncOutcome | null>(null);

  // The live board, without making it a dependency: re-running this effect every time a
  // card moves would sync on every keystroke's worth of Firestore traffic. Written in an
  // effect, not during render — a render can be thrown away, and a ref mutated on a
  // discarded render is a real inconsistency, not a lint technicality.
  const latest = useRef({ tasks, projects, actor, link, members });
  useEffect(() => {
    latest.current = { tasks, projects, actor, link, members };
  }, [tasks, projects, actor, link, members]);

  // One sync at a time. Two concurrent runs both see "no card for this branch" and both
  // create one — the twin bug, arrived at from a different direction.
  const running = useRef(false);

  const uid = actor?.uid ?? null;
  const canSync = ready && !!uid && link?.status === 'connected';

  /**
   * Depend on the SCALARS this effect reads — never on the `link` object.
   *
   * `subscribeToLink` mints a fresh object on every snapshot, and this effect's success
   * path writes `markSynced` to the very document that listener watches. With `link` in
   * the deps that closes a circle: sync → markSynced → snapshot → new object identity →
   * effect re-runs → sync. Measured on the board it settled after a couple of passes
   * rather than running away, so this is not the live billing incident it looks like —
   * but an effect whose output is its own input is one Firestore behaviour away from
   * being one, and the fix costs nothing. `running` wouldn't save it either: that guard
   * is released in `finally`, so a re-entry that is sequential rather than concurrent
   * walks straight past it.
   *
   * **`lastSyncedAt` must not appear here in ANY form — not the timestamp, and not its
   * nullness.** An earlier version of this comment argued that nullness was safe because
   * it's "just a boolean". It isn't: `markSynced` is what makes it non-null, so the first
   * successful sync flips that boolean exactly once, re-runs this effect exactly once, and
   * the second run reads a `tasks` snapshot the listener hasn't refreshed yet — so it
   * builds a card that already exists. Exactly one twin, which is exactly what shipped:
   * two identical PR #40 cards on the production board.
   *
   * `running` can't catch it either. The guard is released in `finally`, so a re-entry
   * that is sequential rather than concurrent walks straight past it.
   *
   * Backfilling is read from `latest.current.link` inside the run instead, where it is
   * fresher anyway. The transaction in `createSensedTask` is the real backstop — an
   * in-memory guard cannot see a second tab — but an effect that retriggers on its own
   * write is a bug on its own terms.
   */
  const linkHandle = link?.handle ?? null;
  const linkStatus = link?.status ?? null;
  const linkCreatesTasks = link?.createTasksFromBranches ?? false;

  useEffect(() => {
    if (!canSync) return;

    let cancelled = false;

    async function run() {
      if (running.current || cancelled) return;
      running.current = true;

      try {
        const current = latest.current;
        if (!current.actor) return;

        const result = await syncFromGitHub({
          actor: current.actor,
          link: current.link,
          tasks: current.tasks,
          projects: current.projects,
          members: current.members,
        });

        // Stamping lastSyncedAt ends the backfill: from here on a status change is real
        // news and logs to the feed. Only on success — a failed sync must not silently
        // promote the next one out of backfill mode and announce last week's work.
        //
        // Deliberately BEFORE the `cancelled` check. This used to bail first, and in
        // StrictMode that meant the run that survives is the cancelled one: it created the
        // cards, then skipped the stamp, so lastSyncedAt stayed null and the backfill never
        // ended. The writes already happened — refusing to record that is how you get a
        // board that re-backfills forever.
        if (result.kind === 'synced') await markSynced(current.actor.uid);

        // `cancelled` guards only the state write — the component may be gone.
        if (!cancelled) setOutcome(result);
      } catch (err) {
        // Belt and braces: syncFromGitHub handles its own failures and returns an outcome.
        console.error('sync: failed', err);
      } finally {
        running.current = false;
      }
    }

    run();
    const timer = setInterval(run, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
    // Scalars only — never the `link` object, and never lastSyncedAt in any form (see
    // above; that one shipped a twin). Deliberately NOT tasks/projects: re-running on
    // every card move would sync on every keystroke's worth of traffic.
  }, [canSync, uid, linkHandle, linkStatus, linkCreatesTasks]);

  return outcome;
}
