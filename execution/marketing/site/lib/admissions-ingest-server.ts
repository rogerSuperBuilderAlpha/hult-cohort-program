import { FieldValue } from 'firebase-admin/firestore';
import { takeHomeRepoFullName } from '@/lib/applications';
import { cohortId } from '@/lib/cohort-config';
import { getAdminDb } from '@/lib/firebase/admin';

const IN_FLIGHT_STATUSES = new Set(['submitted', 'take-home-sent']);

export type TakeHomePrIngestResult =
  | { ingested: true; applicationId: string; githubHandle: string }
  | { ingested: false; reason: string };

/** Record a take-home PR opened on the admissions repo → application status update. */
export async function ingestTakeHomePullRequest(params: {
  repoFullName: string;
  authorLogin: string | null | undefined;
  prNumber: number;
  prHtmlUrl: string;
}): Promise<TakeHomePrIngestResult> {
  const expectedRepo = takeHomeRepoFullName();
  if (params.repoFullName.toLowerCase() !== expectedRepo.toLowerCase()) {
    return { ingested: false, reason: 'not take-home repo' };
  }

  const handle = params.authorLogin?.trim().toLowerCase();
  if (!handle) {
    return { ingested: false, reason: 'missing PR author' };
  }

  const db = getAdminDb();
  const id = cohortId();
  const snap = await db
    .collection('applications')
    .where('githubHandle', '==', handle)
    .limit(10)
    .get();

  const doc = snap.docs.find((d) => d.data().cohort === id);
  if (!doc) {
    return { ingested: false, reason: 'no application for author' };
  }

  const data = doc.data();
  const status = data.status as string | undefined;
  if (status === 'take-home-submitted') {
    return { ingested: false, reason: 'already submitted' };
  }
  if (!status || !IN_FLIGHT_STATUSES.has(status)) {
    return { ingested: false, reason: `status not in-flight (${status ?? 'none'})` };
  }

  await doc.ref.set(
    {
      status: 'take-home-submitted',
      takeHomeSubmittedAt: FieldValue.serverTimestamp(),
      takeHomePrUrl: params.prHtmlUrl,
      takeHomePrNumber: params.prNumber,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { ingested: true, applicationId: doc.id, githubHandle: handle };
}
