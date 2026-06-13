import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { programProjects } from '@/content/program';

const COHORT = 'fall26';

export type AccountDeletionResult = {
  applicationsDeleted: number;
  rosterRemoved: boolean;
  submissionsDeleted: number;
  writtenReviewsDeleted: number;
  ratingsDeleted: number;
  authUserDeleted: boolean;
};

/**
 * Deletes all platform-held data authored by a participant: their application(s),
 * roster membership, submission entries, authored written reviews, and authored peer
 * ratings, plus the Firebase Auth user. Aggregate votes cast by other participants
 * (which reference this handle as a key) are intentionally preserved for contest
 * integrity; the handle is the user's public GitHub identity, not private PII.
 */
export async function deleteParticipantAccount(params: {
  githubHandle: string;
  firebaseUid?: string;
}): Promise<AccountDeletionResult> {
  const db = getAdminDb();
  const { githubHandle, firebaseUid } = params;

  const result: AccountDeletionResult = {
    applicationsDeleted: 0,
    rosterRemoved: false,
    submissionsDeleted: 0,
    writtenReviewsDeleted: 0,
    ratingsDeleted: 0,
    authUserDeleted: false,
  };

  const appSnap = await db
    .collection('applications')
    .where('githubHandle', '==', githubHandle)
    .get();
  await Promise.all(appSnap.docs.map((doc) => doc.ref.delete()));
  result.applicationsDeleted = appSnap.size;

  const rosterRef = db
    .collection('roster')
    .doc(COHORT)
    .collection('members')
    .doc(githubHandle);
  const rosterDoc = await rosterRef.get();
  if (rosterDoc.exists) {
    await rosterRef.delete();
    result.rosterRemoved = true;
  }

  await Promise.all(
    programProjects.map(async (project) => {
      const submissionRef = db
        .collection('submissions')
        .doc(COHORT)
        .collection('projects')
        .doc(project.slug)
        .collection('entries')
        .doc(githubHandle);
      const submissionDoc = await submissionRef.get();
      if (submissionDoc.exists) {
        await submissionRef.delete();
        result.submissionsDeleted += 1;
      }

      const writtenVoterRef = db
        .collection('peerWrittenReviews')
        .doc(COHORT)
        .collection('projects')
        .doc(project.slug)
        .collection('voters')
        .doc(githubHandle);
      const writtenEntries = await writtenVoterRef.collection('entries').get();
      if (!writtenEntries.empty) {
        await Promise.all(writtenEntries.docs.map((d) => d.ref.delete()));
        result.writtenReviewsDeleted += writtenEntries.size;
      }
      const writtenVoterDoc = await writtenVoterRef.get();
      if (writtenVoterDoc.exists) await writtenVoterRef.delete();

      const ratingsRef = db
        .collection('peerRatings')
        .doc(COHORT)
        .collection('projects')
        .doc(project.slug)
        .collection('voters')
        .doc(githubHandle);
      const ratingsDoc = await ratingsRef.get();
      if (ratingsDoc.exists) {
        const ratings = ratingsDoc.data()?.ratings ?? {};
        result.ratingsDeleted += Object.keys(ratings).length;
        await ratingsRef.delete();
      }
    })
  );

  if (firebaseUid) {
    try {
      await getAdminAuth().deleteUser(firebaseUid);
      result.authUserDeleted = true;
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: string }).code)
          : '';
      if (code !== 'auth/user-not-found') throw err;
    }
  }

  return result;
}
