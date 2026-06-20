import { isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId } from '@/lib/cohort-config';
import {
  peerRatingsVotersRef,
  rosterMembersRef,
  submissionEntriesRef,
} from '@/lib/firestore-paths';

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

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

function compareRows(a: TallyRow, b: TallyRow): number {
  if (b.up !== a.up) return b.up - a.up;
  if (a.down !== b.down) return a.down - b.down;
  const aTime = a.mergedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const bTime = b.mergedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  if (aTime !== bTime) return aTime - bTime;
  return a.handle.localeCompare(b.handle);
}

/**
 * Staff-only thumbs-up tally for a Phase 1 review-week project.
 * Winner = most 👍; tie-break = fewest 👎, then earliest mergedAt.
 */
export async function tallyThumbsUp(projectSlug: string): Promise<TallyResult | null> {
  if (!isAdminConfigured()) return null;

  const id = cohortId();

  const [rosterSnap, entriesSnap, votersSnap] = await Promise.all([
    rosterMembersRef(id).get(),
    submissionEntriesRef(id, projectSlug).where('merged', '==', true).get(),
    peerRatingsVotersRef(id, projectSlug).get(),
  ]);

  const activeHandles = new Set(
    rosterSnap.docs.filter((d) => d.data().active !== false).map((d) => d.id)
  );

  const mergedAtByHandle = new Map<string, Date | null>();
  for (const doc of entriesSnap.docs) {
    if (!activeHandles.has(doc.id)) continue;
    mergedAtByHandle.set(doc.id, toDate(doc.data().mergedAt));
  }

  const upCounts = new Map<string, number>();
  const downCounts = new Map<string, number>();

  for (const voterDoc of votersSnap.docs) {
    const ratings = voterDoc.data()?.ratings ?? {};
    for (const [revieweeHandle, value] of Object.entries(ratings)) {
      if (!mergedAtByHandle.has(revieweeHandle)) continue;
      if (value === 'up') {
        upCounts.set(revieweeHandle, (upCounts.get(revieweeHandle) ?? 0) + 1);
      } else if (value === 'down') {
        downCounts.set(revieweeHandle, (downCounts.get(revieweeHandle) ?? 0) + 1);
      }
    }
  }

  const rows: TallyRow[] = [...mergedAtByHandle.keys()]
    .map((handle) => ({
      handle,
      up: upCounts.get(handle) ?? 0,
      down: downCounts.get(handle) ?? 0,
      mergedAt: mergedAtByHandle.get(handle) ?? null,
    }))
    .sort(compareRows);

  return {
    projectSlug,
    cohortId: id,
    rows,
    winner: rows[0]?.handle ?? null,
  };
}
