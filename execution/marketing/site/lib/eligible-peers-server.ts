import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId } from '@/lib/cohort-config';
import type { PeerRatingTarget } from '@/lib/project-progress-types';
import { githubRepoUrl } from '@/lib/project-progress-format';

export type EligiblePeerRow = {
  handle: string;
  repo: string;
  prUrl: string;
  deployUrl: string | null;
};

/**
 * Single definition of the peer review set: active roster members with merged
 * submissions for this project, excluding the requesting participant.
 */
export async function getEligiblePeerRows(
  projectSlug: string,
  voterHandle: string
): Promise<EligiblePeerRow[]> {
  if (!isAdminConfigured()) return [];

  const db = getAdminDb();
  const id = cohortId();

  const [rosterSnap, entriesSnap] = await Promise.all([
    db.collection('roster').doc(id).collection('members').get(),
    db
      .collection('submissions')
      .doc(id)
      .collection('projects')
      .doc(projectSlug)
      .collection('entries')
      .where('merged', '==', true)
      .get(),
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
        repo: data.repo as string,
        prUrl: data.prUrl as string,
        deployUrl: (data.deployUrl as string | null) ?? null,
      };
    })
    .sort((a, b) => a.handle.localeCompare(b.handle));
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

export async function isEligiblePeer(
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string
): Promise<boolean> {
  const rows = await getEligiblePeerRows(projectSlug, voterHandle);
  return rows.some((row) => row.handle === revieweeHandle);
}

export async function getEligiblePeerRepo(
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string
): Promise<string | null> {
  const rows = await getEligiblePeerRows(projectSlug, voterHandle);
  return rows.find((row) => row.handle === revieweeHandle)?.repo ?? null;
}
