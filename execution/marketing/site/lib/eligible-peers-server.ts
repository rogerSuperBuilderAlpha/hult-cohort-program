import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId, cohortSubmissionRepo } from '@/lib/cohort-config';
import { listMergedProjectSubmissions } from '@/lib/github-cohort-server';
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

function toActiveHandleSet(handles: string[]): Set<string> {
  return new Set(handles.map((h) => h.toLowerCase()));
}

async function loadMergedRowsFromGithub(projectSlug: string): Promise<EligiblePeerRow[]> {
  const id = cohortId();
  const activeHandles = toActiveHandleSet(await getActiveRosterHandles(id));
  const submissions = await listMergedProjectSubmissions(id, projectSlug);
  return submissions
    .filter((row) => activeHandles.has(row.githubHandle.toLowerCase()))
    .map((row) => ({
      handle: row.githubHandle.toLowerCase(),
      repo: row.repo,
      prUrl: row.prUrl,
      deployUrl: row.deployUrl,
    }))
    .sort((a, b) => a.handle.localeCompare(b.handle));
}

/** Shared peer list for a project (all voters share this; filter self after). */
const getMergedPeerRowsCached = cache(async (projectSlug: string): Promise<EligiblePeerRow[]> => {
  const cached = unstable_cache(
    async () => {
      if (!isAdminConfigured()) return [] as EligiblePeerRow[];
      return loadMergedRowsFromGithub(projectSlug);
    },
    ['merged-peer-rows-v5', cohortId(), projectSlug],
    { revalidate: 60, tags: [`peers:${cohortId()}:${projectSlug}`, `contest:${cohortId()}:${projectSlug}`] }
  );
  return cached();
});

export async function getEligiblePeerRows(
  projectSlug: string,
  voterHandle: string
): Promise<EligiblePeerRow[]> {
  if (!isAdminConfigured()) return [];
  const rows = await getMergedPeerRowsCached(projectSlug);
  const self = voterHandle.toLowerCase();
  return rows.filter((row) => row.handle !== self);
}

export function mergePeerProgress(
  rows: EligiblePeerRow[],
  reviews: Record<string, { issueUrl: string; upvoted: boolean }>
): PeerRatingTarget[] {
  return rows.map((row) => {
    const review = reviews[row.handle] ?? null;
    return {
      handle: row.handle,
      repo: row.repo,
      repoUrl: githubRepoUrl(row.repo),
      prUrl: row.prUrl,
      deployUrl: row.deployUrl,
      reviewFiled: review !== null,
      reviewIssueUrl: review?.issueUrl ?? null,
      upvoted: review?.upvoted === true,
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
  const voter = voterHandle.toLowerCase();
  const reviewee = revieweeHandle.toLowerCase();
  if (voter === reviewee) return null;

  const active = toActiveHandleSet(await getActiveRosterHandles(cohortId()));
  if (!active.has(reviewee)) return null;

  const submission = await resolveParticipantSubmission(projectSlug, reviewee);
  if (!submission?.merged) return null;

  return {
    handle: reviewee,
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
