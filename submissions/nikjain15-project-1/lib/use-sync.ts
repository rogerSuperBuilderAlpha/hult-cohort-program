'use client';

import { useEffect, useRef, useState } from 'react';
import { markSynced } from './github-link';
import { syncFromGitHub, type SyncOutcome } from './sync';
import type { GitHubLink, Project, Task } from './types';

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
  /** Listeners must have delivered first, or the dedupe runs against an empty board and twins everything. */
  ready: boolean;
}): SyncOutcome | null {
  const { actor, link, tasks, projects, ready } = input;
  const [outcome, setOutcome] = useState<SyncOutcome | null>(null);

  // The live board, without making it a dependency: re-running this effect every time a
  // card moves would sync on every keystroke's worth of Firestore traffic. Written in an
  // effect, not during render — a render can be thrown away, and a ref mutated on a
  // discarded render is a real inconsistency, not a lint technicality.
  const latest = useRef({ tasks, projects, actor });
  useEffect(() => {
    latest.current = { tasks, projects, actor };
  }, [tasks, projects, actor]);

  // One sync at a time. Two concurrent runs both see "no card for this branch" and both
  // create one — the twin bug, arrived at from a different direction.
  const running = useRef(false);

  const uid = actor?.uid ?? null;
  const canSync = ready && !!uid && link?.status === 'connected';

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
          link,
          tasks: current.tasks,
          projects: current.projects,
        });

        if (cancelled) return;
        setOutcome(result);

        // Stamping lastSyncedAt is what ends the backfill: from here on, a status change
        // is real news and logs to the feed. Only stamp on success — a failed sync must
        // not silently promote the next one out of backfill mode and announce old work.
        if (result.kind === 'synced') await markSynced(current.actor.uid);
      } catch (err) {
        // Belt and braces: syncFromGitHub already swallows its own failures.
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
    // link is the whole gate; uid identifies the actor. Deliberately NOT tasks/projects.
  }, [canSync, uid, link]);

  return outcome;
}
