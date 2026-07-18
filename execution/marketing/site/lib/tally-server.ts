import { cohortId } from '@/lib/cohort-config';
import { buildContestState } from '@/lib/contest-state-server';

export type TallyRow = {
  handle: string;
  up: number;
  down: number;
  mergedAt: Date | null;
};

export type TallyResult = {
  projectSlug: string;
  cohortId: string;
  rows: TallyRow[];
  winner: string | null;
};

function compareRows(a: TallyRow, b: TallyRow): number {
  if (b.up !== a.up) return b.up - a.up;
  const aTime = a.mergedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const bTime = b.mergedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  if (aTime !== bTime) return aTime - bTime;
  return a.handle.localeCompare(b.handle);
}

/**
 * Staff-only upvote tally from GitHub contest state.
 * Winner = most Vote: up; tie-break = earliest mergedAt. Not exposed on the site UI.
 */
export async function tallyThumbsUp(projectSlug: string): Promise<TallyResult | null> {
  const id = cohortId();
  const state = await buildContestState(projectSlug);

  const upCounts = new Map<string, number>();
  for (const byReviewee of Object.values(state.reviews)) {
    for (const [reviewee, review] of Object.entries(byReviewee)) {
      if (!review.upvoted) continue;
      upCounts.set(reviewee, (upCounts.get(reviewee) ?? 0) + 1);
    }
  }

  const rows: TallyRow[] = state.submissions
    .map((sub) => ({
      handle: sub.handle,
      up: upCounts.get(sub.handle) ?? 0,
      down: 0,
      mergedAt: sub.mergedAt ? new Date(sub.mergedAt) : null,
    }))
    .sort(compareRows);

  // rows already sorted: most upvotes → earliest mergedAt → handle
  const winner = rows[0]?.handle ?? null;

  return {
    projectSlug,
    cohortId: id,
    rows,
    winner,
  };
}
