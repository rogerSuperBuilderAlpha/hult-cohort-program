import type { MasteryMap } from "./persistence";
import type { Question } from "./questions";
import { shuffleArray } from "./shuffle";

/** 3-box Leitner intervals (ms). */
export const LEITNER_INTERVALS_MS = {
  1: 0,
  2: 24 * 60 * 60 * 1000,
  3: 3 * 24 * 60 * 60 * 1000,
} as const;

export type SessionBuckets = {
  weak: Question[];
  due: Question[];
  fresh: Question[];
  strong: Question[];
};

export function classifyQuestions(
  pool: Question[],
  mastery: MasteryMap,
  now = Date.now(),
): SessionBuckets {
  const buckets: SessionBuckets = {
    weak: [],
    due: [],
    fresh: [],
    strong: [],
  };

  for (const q of pool) {
    const entry = mastery[String(q.id)];
    if (!entry) {
      buckets.fresh.push(q);
      continue;
    }
    if (entry.box === 1 || entry.status === "learning") {
      buckets.weak.push(q);
      continue;
    }
    const dueTime = Date.parse(entry.dueAt);
    if (Number.isFinite(dueTime) && dueTime <= now) {
      buckets.due.push(q);
    } else {
      buckets.strong.push(q);
    }
  }

  return buckets;
}

export type SessionComposition = {
  weak: number;
  due: number;
  fresh: number;
  strong: number;
  total: number;
};

/**
 * Builds an adaptive session: ~60% weak, ~30% due reviews, ~10% new.
 * Backfills from remaining buckets so short category pools still fill.
 */
export function buildAdaptiveSession(
  pool: Question[],
  mastery: MasteryMap,
  options?: { targetSize?: number; now?: number },
): { questions: Question[]; composition: SessionComposition } {
  if (pool.length === 0) {
    return {
      questions: [],
      composition: { weak: 0, due: 0, fresh: 0, strong: 0, total: 0 },
    };
  }

  const now = options?.now ?? Date.now();
  const target =
    options?.targetSize ??
    (pool.length <= 8 ? pool.length : Math.min(12, pool.length));

  const buckets = classifyQuestions(pool, mastery, now);
  const weakQ = shuffleArray(buckets.weak);
  const dueQ = shuffleArray(buckets.due);
  const freshQ = shuffleArray(buckets.fresh);
  const strongQ = shuffleArray(buckets.strong);

  let weakN = Math.min(weakQ.length, Math.round(target * 0.6));
  let dueN = Math.min(dueQ.length, Math.round(target * 0.3));
  let freshN = Math.min(freshQ.length, Math.max(0, target - weakN - dueN));

  let remaining = target - weakN - dueN - freshN;
  const takeMore = (arr: Question[], already: number) => {
    const extra = Math.min(remaining, Math.max(0, arr.length - already));
    remaining -= extra;
    return already + extra;
  };

  freshN = takeMore(freshQ, freshN);
  dueN = takeMore(dueQ, dueN);
  weakN = takeMore(weakQ, weakN);
  const strongN = takeMore(strongQ, 0);

  const selected = [
    ...weakQ.slice(0, weakN),
    ...dueQ.slice(0, dueN),
    ...freshQ.slice(0, freshN),
    ...strongQ.slice(0, strongN),
  ];

  return {
    questions: shuffleArray(selected).map(withShuffledOptions),
    composition: {
      weak: weakN,
      due: dueN,
      fresh: freshN,
      strong: strongN,
      total: selected.length,
    },
  };
}

/**
 * Explore mode: random sample from the category pool (ignores Leitner priority).
 * Still reports composition so the UI can show what you drew.
 */
export function buildExploreSession(
  pool: Question[],
  mastery: MasteryMap,
  options?: { targetSize?: number; now?: number },
): { questions: Question[]; composition: SessionComposition } {
  if (pool.length === 0) {
    return {
      questions: [],
      composition: { weak: 0, due: 0, fresh: 0, strong: 0, total: 0 },
    };
  }

  const now = options?.now ?? Date.now();
  const target =
    options?.targetSize ??
    (pool.length <= 8 ? pool.length : Math.min(12, pool.length));

  const selected = shuffleArray(pool).slice(0, target);
  const buckets = classifyQuestions(selected, mastery, now);

  return {
    questions: selected.map(withShuffledOptions),
    composition: {
      weak: buckets.weak.length,
      due: buckets.due.length,
      fresh: buckets.fresh.length,
      strong: buckets.strong.length,
      total: selected.length,
    },
  };
}

/** Shuffle MCQ distractor order so position isn't learnable. */
export function withShuffledOptions(question: Question): Question {
  if (question.type !== "mcq") return question;
  return { ...question, options: shuffleArray(question.options) };
}

export function buildRematchDeck(missed: Question[]): Question[] {
  return shuffleArray(missed).map(withShuffledOptions);
}
