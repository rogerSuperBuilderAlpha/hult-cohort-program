import type { Firestore } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase/admin';

function db(): Firestore {
  return getAdminDb();
}

export function rosterMembersRef(cohortId: string) {
  return db().collection('roster').doc(cohortId).collection('members');
}

export function rosterMemberRef(cohortId: string, githubHandle: string) {
  return rosterMembersRef(cohortId).doc(githubHandle);
}

export function submissionEntriesRef(cohortId: string, projectSlug: string) {
  return db()
    .collection('submissions')
    .doc(cohortId)
    .collection('projects')
    .doc(projectSlug)
    .collection('entries');
}

export function submissionEntryRef(cohortId: string, projectSlug: string, githubHandle: string) {
  return submissionEntriesRef(cohortId, projectSlug).doc(githubHandle);
}

export function writtenReviewVoterRef(
  cohortId: string,
  projectSlug: string,
  voterHandle: string
) {
  return db()
    .collection('peerWrittenReviews')
    .doc(cohortId)
    .collection('projects')
    .doc(projectSlug)
    .collection('voters')
    .doc(voterHandle);
}

export function writtenReviewEntriesRef(
  cohortId: string,
  projectSlug: string,
  voterHandle: string
) {
  return writtenReviewVoterRef(cohortId, projectSlug, voterHandle).collection('entries');
}

export function writtenReviewEntryRef(
  cohortId: string,
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string
) {
  return writtenReviewEntriesRef(cohortId, projectSlug, voterHandle).doc(revieweeHandle);
}

export function peerRatingsVotersRef(cohortId: string, projectSlug: string) {
  return db()
    .collection('peerRatings')
    .doc(cohortId)
    .collection('projects')
    .doc(projectSlug)
    .collection('voters');
}

export function peerRatingsVoterRef(cohortId: string, projectSlug: string, voterHandle: string) {
  return peerRatingsVotersRef(cohortId, projectSlug).doc(voterHandle);
}

/**
 * Research survey collections. Documents are keyed by a one-way participant hash (`pid`), never the
 * GitHub handle, so survey responses are not stored beside identifying records (see survey-server.ts).
 */
export function researchConsentRef(cohortId: string, pid: string) {
  return db().collection('researchConsent').doc(cohortId).collection('participants').doc(pid);
}

export function surveyResponsesRef(cohortId: string, waveId: string) {
  return db()
    .collection('researchSurveys')
    .doc(cohortId)
    .collection('waves')
    .doc(waveId)
    .collection('responses');
}

export function surveyResponseRef(cohortId: string, waveId: string, pid: string) {
  return surveyResponsesRef(cohortId, waveId).doc(pid);
}
