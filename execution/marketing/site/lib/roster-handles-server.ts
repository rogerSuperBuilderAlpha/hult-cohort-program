import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { isAdminConfigured } from '@/lib/firebase/admin';
import { rosterMembersRef } from '@/lib/firestore-paths';

/**
 * Active roster GitHub handles. Request-deduped (React cache) + 60s cross-request
 * cache so homepage/stats/peers/dashboard share one roster scan.
 */
export const getActiveRosterHandles = cache(async (cohortId: string): Promise<string[]> => {
  const cached = unstable_cache(
    async () => {
      if (!isAdminConfigured()) return [] as string[];
      try {
        const snap = await rosterMembersRef(cohortId).get();
        return snap.docs.filter((doc) => doc.data().active !== false).map((doc) => doc.id);
      } catch (err) {
        console.error(
          '[getActiveRosterHandles]',
          err instanceof Error ? err.message : err
        );
        return [] as string[];
      }
    },
    ['active-roster-handles', cohortId],
    { revalidate: 60, tags: [`roster-handles:${cohortId}`] }
  );
  return cached();
});
