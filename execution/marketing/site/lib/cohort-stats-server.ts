import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import type { CohortStats } from './cohort-stats-types';

export type { CohortStats } from './cohort-stats-types';

export async function getCohortStats(cohortId = 'fall26'): Promise<CohortStats> {
  const empty = { cohortId, enrolledCount: 0, peerReviewCount: 0 };

  if (!isAdminConfigured()) {
    return empty;
  }

  try {
    const db = getAdminDb();
    const snap = await db.collection('roster').doc(cohortId).collection('members').get();

    const enrolledCount = snap.docs.filter((doc) => doc.data().active !== false).length;

    return {
      cohortId,
      enrolledCount,
      peerReviewCount: Math.max(0, enrolledCount - 1),
    };
  } catch (err) {
    console.error('getCohortStats failed:', err);
    return empty;
  }
}
