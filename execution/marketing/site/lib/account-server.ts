import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { cohortId, nextCohortId } from '@/lib/cohort-config';
import { programProjects } from '@/content/program';
import {
  peerRatingsVoterRef,
  rosterMemberRef,
  submissionEntryRef,
  cohortInterestRef,
  writtenReviewEntriesRef,
  writtenReviewVoterRef,
} from '@/lib/firestore-paths';
import { researchDeletionTargets } from '@/lib/research-deletion-targets';

export type AccountDeletionResult = {
  applicationsDeleted: number;
  rosterRemoved: boolean;
  submissionsDeleted: number;
  writtenReviewsDeleted: number;
  ratingsDeleted: number;
  cohortInterestRemoved: boolean;
  researchRecordsDeleted: number;
  authUserDeleted: boolean;
};

/**
 * Deletes platform-held data for a participant: application(s), roster membership,
 * legacy submission entries, authored written reviews, authored peer ratings,
 * expectations acknowledgment, research consent, and survey responses (by coded id),
 * plus the Firebase Auth user. Public GitHub repositories, pull requests, and issues
 * are not touched. Aggregate votes cast by other participants are preserved.
 */
export async function deleteParticipantAccount(params: {
  githubHandle: string;
  firebaseUid?: string;
}): Promise<AccountDeletionResult> {
  const db = getAdminDb();
  const id = cohortId();
  const { githubHandle, firebaseUid } = params;

  const result: AccountDeletionResult = {
    applicationsDeleted: 0,
    rosterRemoved: false,
    submissionsDeleted: 0,
    writtenReviewsDeleted: 0,
    ratingsDeleted: 0,
    cohortInterestRemoved: false,
    researchRecordsDeleted: 0,
    authUserDeleted: false,
  };

  const appSnap = await db
    .collection('applications')
    .where('githubHandle', '==', githubHandle)
    .limit(25)
    .get();
  await Promise.all(appSnap.docs.map((doc) => doc.ref.delete()));
  result.applicationsDeleted = appSnap.size;

  const rosterRef = rosterMemberRef(id, githubHandle);
  const rosterDoc = await rosterRef.get();
  if (rosterDoc.exists) {
    await rosterRef.delete();
    result.rosterRemoved = true;
  }

  await Promise.all(
    programProjects.map(async (project) => {
      const submissionRef = submissionEntryRef(id, project.slug, githubHandle);
      const submissionDoc = await submissionRef.get();
      if (submissionDoc.exists) {
        await submissionRef.delete();
        result.submissionsDeleted += 1;
      }

      const writtenVoterRef = writtenReviewVoterRef(id, project.slug, githubHandle);
      const writtenEntries = await writtenReviewEntriesRef(id, project.slug, githubHandle).get();
      if (!writtenEntries.empty) {
        await Promise.all(writtenEntries.docs.map((d) => d.ref.delete()));
        result.writtenReviewsDeleted += writtenEntries.size;
      }
      const writtenVoterDoc = await writtenVoterRef.get();
      if (writtenVoterDoc.exists) await writtenVoterRef.delete();

      const ratingsRef = peerRatingsVoterRef(id, project.slug, githubHandle);
      const ratingsDoc = await ratingsRef.get();
      if (ratingsDoc.exists) {
        const ratings = ratingsDoc.data()?.ratings ?? {};
        result.ratingsDeleted += Object.keys(ratings).length;
        await ratingsRef.delete();
      }
    })
  );

  const upcoming = nextCohortId();
  if (upcoming) {
    const interestRef = cohortInterestRef(upcoming, githubHandle);
    const interestDoc = await interestRef.get();
    if (interestDoc.exists) {
      await interestRef.delete();
      result.cohortInterestRemoved = true;
    }
  }

  const researchTargets = researchDeletionTargets(id, githubHandle);
  await Promise.all(researchTargets.map((target) => db.doc(target.path).delete()));
  result.researchRecordsDeleted = researchTargets.length;

  if (firebaseUid) {
    try {
      const auth = await getAdminAuth();
      await auth.deleteUser(firebaseUid);
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
