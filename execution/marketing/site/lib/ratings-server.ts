/**
 * Legacy Firestore peerRatings helpers (account cleanup only).
 * Contest votes are GitHub `Vote: up` lines — see contest-state-server.ts.
 */

import { peerRatingsVoterRef } from '@/lib/firestore-paths';
import { cohortId } from '@/lib/cohort-config';

function ratingsRef(projectSlug: string, voterHandle: string) {
  return peerRatingsVoterRef(cohortId(), projectSlug, voterHandle);
}

export async function deleteVoterRatings(projectSlug: string, voterHandle: string): Promise<void> {
  await ratingsRef(projectSlug, voterHandle).delete().catch(() => undefined);
}
