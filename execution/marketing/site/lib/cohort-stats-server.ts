import { isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId } from '@/lib/cohort-config';
import { getActiveRosterHandles } from '@/lib/roster-handles-server';
import type { CohortStats } from './cohort-stats-types';

function emptyStats(id: string, available = false): CohortStats {
  return {
    cohortId: id,
    enrolledCount: 0,
    peerReviewCount: 0,
    available,
  };
}

/**
 * Live roster-derived cohort size. Uses shared cached roster handles
 * (60s) so marketing pages and APIs don't each scan the collection.
 */
export async function getCohortStats(id = cohortId()): Promise<CohortStats> {
  if (!isAdminConfigured()) {
    return emptyStats(id, false);
  }

  const handles = await getActiveRosterHandles(id);
  // Empty list after a quota failure is indistinguishable from an empty roster;
  // treat "admin configured + empty" as available so UI still renders.
  const enrolledCount = handles.length;

  return {
    cohortId: id,
    enrolledCount,
    peerReviewCount: Math.max(0, enrolledCount - 1),
    available: true,
  };
}
