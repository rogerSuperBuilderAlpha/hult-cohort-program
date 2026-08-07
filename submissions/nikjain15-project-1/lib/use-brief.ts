'use client';

import { useEffect, useMemo, useState } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { assembleBrief, briefIsEmpty, type BriefFacts } from './brief-fallback';

/**
 * The Home brief, resolved. Mirrors how narration caches (lib/sync.ts + markWorkNarrated):
 * the model call lives behind a route, and its result is cached in the reader's OWN Firestore
 * doc so a revisit costs nothing. A brief is only regenerated when the week's facts change —
 * the same "cache miss on unchanged work is a bug, not an inefficiency" logic that keeps the
 * narration bill bounded (TESTING.md §0.1).
 *
 * `source` lets the UI mark a genuinely model-written brief distinctly from the warm
 * assembled fallback; `empty` means an empty week (render nothing).
 */
export type BriefState = {
  text: string;
  source: 'model' | 'facts' | 'empty';
  loading: boolean;
};

/** ISO-8601 week key (e.g. "2026-W29"), so a new week regenerates even if counts coincide. */
function isoWeek(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Thursday of the current week decides the year (ISO rule).
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Stable string of the facts, fixed field order — the cache key's identity. */
function factsSignature(f: BriefFacts): string {
  return [
    f.displayName,
    f.cohortShipped,
    f.cohortFiguredOut,
    f.cohortUnstuck,
    f.shipStreakDays,
    f.youShipped,
    f.youUnstuck,
    f.youKudos,
    f.yourOpenTitles.join('¦'),
  ].join('|');
}

/** FNV-1a over the signature + week — a short, stable cache hash. */
function hashKey(signature: string, week: string): string {
  let h = 0x811c9dc5;
  const s = `${week}::${signature}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

export function useBrief({
  uid,
  facts,
  narrationOptIn,
}: {
  uid: string;
  facts: BriefFacts;
  /** The reader's own consent gate (githubLinks/{uid}). Off → no model call, warm fallback. */
  narrationOptIn: boolean;
}): BriefState {
  const signature = useMemo(() => factsSignature(facts), [facts]);
  // Seed with the warm assembled sentence so the first paint is never empty or a spinner —
  // the model text (or the same fallback) settles in from the effect.
  const [state, setState] = useState<BriefState>(() => ({
    text: assembleBrief(facts),
    source: 'facts',
    loading: true,
  }));

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // An empty week says nothing (VOICE rule 4 puts the invitation elsewhere).
      if (briefIsEmpty(facts)) {
        if (!cancelled) setState({ text: '', source: 'empty', loading: false });
        return;
      }

      const fallback = assembleBrief(facts);

      // Not opted into narration → never call the model. The warm assembled sentence stands
      // in, exactly as facts-only narration does; it's honest, just not model-written.
      if (!narrationOptIn) {
        if (!cancelled) setState({ text: fallback, source: 'facts', loading: false });
        return;
      }

      const week = isoWeek(new Date());
      const hash = hashKey(signature, week);

      // Cache first: a revisit with the same week's facts pays nothing.
      try {
        const snap = await getDoc(doc(db, 'briefs', uid));
        const cached = snap.data();
        if (
          cached &&
          cached.week === week &&
          cached.hash === hash &&
          typeof cached.text === 'string'
        ) {
          if (!cancelled) setState({ text: cached.text, source: 'model', loading: false });
          return;
        }
      } catch {
        // Cache read failed — fall through to the route, then the fallback.
      }

      // Show the warm sentence while the model writes, so Home never flashes empty.
      if (!cancelled) setState({ text: fallback, source: 'facts', loading: true });

      try {
        const res = await fetch('/api/brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(facts),
        });
        if (res.ok) {
          const data = (await res.json()) as { kind: string; text?: string };
          if (data.kind === 'written' && typeof data.text === 'string' && data.text.length > 0) {
            if (!cancelled) setState({ text: data.text, source: 'model', loading: false });
            // Cache under the reader's own uid — rules let only them write it. Best-effort:
            // a failed cache write just means the next visit regenerates, never an error.
            void setDoc(doc(db, 'briefs', uid), {
              week,
              hash,
              text: data.text,
              updatedAt: serverTimestamp(),
            }).catch(() => {});
            return;
          }
        }
      } catch {
        // Network/route failure — the warm fallback below is the honest answer.
      }

      if (!cancelled) setState({ text: fallback, source: 'facts', loading: false });
    })();

    return () => {
      cancelled = true;
    };
    // `facts` is intentionally not a dep: `signature` is derived from its content, so the
    // effect re-runs exactly when the content changes — depending on the object's identity
    // would refetch on every render for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, signature, narrationOptIn]);

  return state;
}
