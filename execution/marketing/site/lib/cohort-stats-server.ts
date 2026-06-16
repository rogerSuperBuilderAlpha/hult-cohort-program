import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId } from '@/lib/cohort-config';
import type { CohortStats } from './cohort-stats-types';

export type { CohortStats } from './cohort-stats-types';

function emptyStats(id: string, available = false): CohortStats {
  return {
    cohortId: id,
    enrolledCount: 0,
    peerReviewCount: 0,
    available,
  };
}

export async function getCohortStats(id = cohortId()): Promise<CohortStats> {
  if (!isAdminConfigured()) {
    return emptyStats(id, false);
  }

  const db = getAdminDb();
  const snap = await db.collection('roster').doc(id).collection('members').get();

  const enrolledCount = snap.docs.filter((doc) => doc.data().active !== false).length;

  return {
    cohortId: id,
    enrolledCount,
    peerReviewCount: Math.max(0, enrolledCount - 1),
    available: true,
  };
}
