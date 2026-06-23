import { isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId, cohortSubmissionRepo, submissionsSource } from '@/lib/cohort-config';
import { listMergedProjectSubmissions } from '@/lib/github-cohort-server';
import { rosterMembersRef, submissionEntriesRef } from '@/lib/firestore-paths';
import type { PeerRatingTarget } from '@/lib/project-progress-types';
import { githubRepoUrl } from '@/lib/github-urls';

export type EligiblePeerRow = {
  handle: string;
  repo: string;
  prUrl: string;
  deployUrl: string | null;
};

async function peerRowsFromGithub(
  projectSlug: string,
  voterHandle: string
): Promise<EligiblePeerRow[]> {
  const id = cohortId();
  const rosterSnap = await rosterMembersRef(id).get();
  const activeHandles = new Set(
    rosterSnap.docs.filter((d) => d.data().active !== false).map((d) => d.id)
  );

  const submissions = await listMergedProjectSubmissions(id, projectSlug);
  return submissions
    .filter(
      (row) =>
        row.githubHandle !== voterHandle &&
        activeHandles.has(row.githubHandle)
    )
    .map((row) => ({
      handle: row.githubHandle,
      repo: row.repo,
      prUrl: row.prUrl,
      deployUrl: row.deployUrl,
    }))
    .sort((a, b) => a.handle.localeCompare(b.handle));
}

async function peerRowsFromFirestore(
  projectSlug: string,
  voterHandle: string
): Promise<EligiblePeerRow[]> {
  const id = cohortId();

  const [rosterSnap, entriesSnap] = await Promise.all([
    rosterMembersRef(id).get(),
    submissionEntriesRef(id, projectSlug).where('merged', '==', true).get(),
  ]);

  const activeHandles = new Set(
    rosterSnap.docs.filter((d) => d.data().active !== false).map((d) => d.id)
  );

  return entriesSnap.docs
    .filter((doc) => doc.id !== voterHandle && activeHandles.has(doc.id))
    .map((doc) => {
      const data = doc.data();
      return {
        handle: doc.id,
        repo: (data.repo as string) || cohortSubmissionRepo(),
        prUrl: data.prUrl as string,
        deployUrl: (data.deployUrl as string | null) ?? null,
      };
    })
    .sort((a, b) => a.handle.localeCompare(b.handle));
}

/**
 * Single definition of the peer review set: active roster members with merged
 * submissions for this project, excluding the requesting participant.
 */
export async function getEligiblePeerRows(
  projectSlug: string,
  voterHandle: string
): Promise<EligiblePeerRow[]> {
  if (!isAdminConfigured()) return [];

  const mode = submissionsSource();

  if (mode === 'firestore') {
    return peerRowsFromFirestore(projectSlug, voterHandle);
  }

  const fromGithub = await peerRowsFromGithub(projectSlug, voterHandle);
  if (fromGithub.length > 0 || mode === 'github') {
    return fromGithub;
  }

  return peerRowsFromFirestore(projectSlug, voterHandle);
}

export function mergePeerProgress(
  rows: EligiblePeerRow[],
  writtenReviews: Record<string, string>,
  ratings: Record<string, 'up' | 'down'>
): PeerRatingTarget[] {
  return rows.map((row) => {
    const reviewIssueUrl = writtenReviews[row.handle] ?? null;
    const myRating = ratings[row.handle] ?? null;
    return {
      handle: row.handle,
      repo: row.repo,
      repoUrl: githubRepoUrl(row.repo),
      prUrl: row.prUrl,
      deployUrl: row.deployUrl,
      reviewFiled: reviewIssueUrl !== null,
      reviewIssueUrl,
      rated: myRating !== null,
      myRating,
    };
  });
}

export async function getEligiblePeerRow(
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string
): Promise<EligiblePeerRow | null> {
  const rows = await getEligiblePeerRows(projectSlug, voterHandle);
  return rows.find((row) => row.handle === revieweeHandle) ?? null;
}

export async function isEligiblePeer(
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string
): Promise<boolean> {
  return (await getEligiblePeerRow(projectSlug, voterHandle, revieweeHandle)) !== null;
}
