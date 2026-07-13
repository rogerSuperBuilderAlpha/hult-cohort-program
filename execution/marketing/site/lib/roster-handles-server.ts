import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';
import { isAdminConfigured } from '@/lib/firebase/admin';
import { rosterMembersRef } from '@/lib/firestore-paths';
import { getAdminDb } from '@/lib/firebase/admin';

function rosterMetaRef(cohortId: string) {
  return getAdminDb().collection('roster').doc(cohortId);
}

async function scanActiveHandles(cohortId: string): Promise<string[]> {
  const snap = await rosterMembersRef(cohortId).get();
  return snap.docs.filter((doc) => doc.data().active !== false).map((doc) => doc.id);
}

/** Write denormalized roster meta (1-doc stats). Call after admit/deactivate. */
export async function refreshRosterMeta(cohortId: string): Promise<string[]> {
  if (!isAdminConfigured()) return [];
  const handles = await scanActiveHandles(cohortId);
  await rosterMetaRef(cohortId).set(
    {
      enrolledCount: handles.length,
      activeHandles: handles,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  return handles;
}

/**
 * Active roster GitHub handles. Prefers roster/{cohortId} meta doc (1 read);
 * falls back to members scan + backfill. Request-deduped + 60s cross-request cache.
 */
export const getActiveRosterHandles = cache(async (cohortId: string): Promise<string[]> => {
  const cached = unstable_cache(
    async () => {
      if (!isAdminConfigured()) return [] as string[];
      try {
        const meta = await rosterMetaRef(cohortId).get();
        const handles = meta.data()?.activeHandles;
        if (Array.isArray(handles) && handles.every((h) => typeof h === 'string')) {
          return handles as string[];
        }
        return await refreshRosterMeta(cohortId);
      } catch (err) {
        console.error(
          '[getActiveRosterHandles]',
          err instanceof Error ? err.message : err
        );
        return [] as string[];
      }
    },
    ['active-roster-handles-v2', cohortId],
    { revalidate: 60, tags: [`roster-handles:${cohortId}`] }
  );
  return cached();
});
