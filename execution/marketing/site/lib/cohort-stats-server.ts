import { unstable_cache } from 'next/cache';
import { isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId } from '@/lib/cohort-config';
import { rosterMembersRef } from '@/lib/firestore-paths';
import type { CohortStats } from './cohort-stats-types';

function emptyStats(id: string, available = false): CohortStats {
  return {
    cohortId: id,
    enrolledCount: 0,
    peerReviewCount: 0,
    available,
  };
}

async function fetchCohortStats(id: string): Promise<CohortStats> {
  if (!isAdminConfigured()) {
    return emptyStats(id, false);
  }

  try {
    const snap = await rosterMembersRef(id).get();
    const enrolledCount = snap.docs.filter((doc) => doc.data().active !== false).length;

    return {
      cohortId: id,
      enrolledCount,
      peerReviewCount: Math.max(0, enrolledCount - 1),
      available: true,
    };
  } catch (err) {
    // Never take down marketing pages on Firestore quota / transient Admin SDK failures.
    console.error('[getCohortStats]', err instanceof Error ? err.message : err);
    return emptyStats(id, false);
  }
}

/**
 * Live roster-derived cohort size. Cached briefly to avoid burning Firestore
 * read quota on every force-dynamic homepage hit.
 */
export async function getCohortStats(id = cohortId()): Promise<CohortStats> {
  const cached = unstable_cache(
    () => fetchCohortStats(id),
    ['cohort-stats', id],
    { revalidate: 60, tags: [`cohort-stats:${id}`] }
  );
  return cached();
}
