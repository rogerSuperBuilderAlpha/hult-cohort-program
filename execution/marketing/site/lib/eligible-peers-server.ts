import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId, cohortSubmissionRepo, submissionsSource } from '@/lib/cohort-config';
import { listMergedProjectSubmissions } from '@/lib/github-cohort-server';
import { submissionEntriesRef } from '@/lib/firestore-paths';
import { getActiveRosterHandles } from '@/lib/roster-handles-server';
import { resolveParticipantSubmission } from '@/lib/submissions-resolve-server';
import type { PeerRatingTarget } from '@/lib/project-progress-types';
import { githubRepoUrl } from '@/lib/github-urls';

export type EligiblePeerRow = {
  handle: string;
  repo: string;
  prUrl: string;
  deployUrl: string | null;
};

async function loadMergedRowsFromGithub(projectSlug: string): Promise<EligiblePeerRow[]> {
  const id = cohortId();
  const activeHandles = new Set(await getActiveRosterHandles(id));
  const submissions = await listMergedProjectSubmissions(id, projectSlug);
  return submissions
    .filter((row) => activeHandles.has(row.githubHandle))
    .map((row) => ({
      handle: row.githubHandle,
      repo: row.repo,
      prUrl: row.prUrl,
      deployUrl: row.deployUrl,
    }))
    .sort((a, b) => a.handle.localeCompare(b.handle));
}

async function loadMergedRowsFromFirestore(projectSlug: string): Promise<EligiblePeerRow[]> {
  const id = cohortId();
  const [activeHandles, entriesSnap] = await Promise.all([
    getActiveRosterHandles(id).then((handles) => new Set(handles)),
    submissionEntriesRef(id, projectSlug).where('merged', '==', true).get(),
  ]);

  return entriesSnap.docs
    .filter((doc) => activeHandles.has(doc.id))
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

/** Shared peer list for a project (all voters share this; filter self after). */
const getMergedPeerRowsCached = cache(async (projectSlug: string): Promise<EligiblePeerRow[]> => {
  const cached = unstable_cache(
    async () => {
      if (!isAdminConfigured()) return [] as EligiblePeerRow[];
      const mode = submissionsSource();
      if (mode === 'firestore') return loadMergedRowsFromFirestore(projectSlug);
      const fromGithub = await loadMergedRowsFromGithub(projectSlug);
      if (fromGithub.length > 0 || mode === 'github') return fromGithub;
      return loadMergedRowsFromFirestore(projectSlug);
    },
    ['merged-peer-rows', cohortId(), projectSlug],
    { revalidate: 60, tags: [`peers:${cohortId()}:${projectSlug}`] }
  );
  return cached();
});

export async function getEligiblePeerRows(
  projectSlug: string,
  voterHandle: string
): Promise<EligiblePeerRow[]> {
  if (!isAdminConfigured()) return [];
  const rows = await getMergedPeerRowsCached(projectSlug);
  return rows.filter((row) => row.handle !== voterHandle);
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

/** Direct eligibility: roster + merged submission — no full peer list. */
export async function getEligiblePeerRow(
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string
): Promise<EligiblePeerRow | null> {
  if (!isAdminConfigured()) return null;
  if (voterHandle === revieweeHandle) return null;

  const active = await getActiveRosterHandles(cohortId());
  if (!active.includes(revieweeHandle)) return null;

  const submission = await resolveParticipantSubmission(projectSlug, revieweeHandle);
  if (!submission?.merged) return null;

  return {
    handle: revieweeHandle,
    repo: submission.repo || cohortSubmissionRepo(),
    prUrl: submission.prUrl || '',
    deployUrl: submission.deployUrl ?? null,
  };
}

export async function isEligiblePeer(
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string
): Promise<boolean> {
  return (await getEligiblePeerRow(projectSlug, voterHandle, revieweeHandle)) !== null;
}
