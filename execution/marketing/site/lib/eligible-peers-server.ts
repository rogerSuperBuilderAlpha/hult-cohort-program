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

function toActiveHandleSet(handles: string[]): Set<string> {
  return new Set(handles.map((h) => h.toLowerCase()));
}

function preferRow(a: EligiblePeerRow | undefined, b: EligiblePeerRow): EligiblePeerRow {
  if (!a) return b;
  // Prefer the row that has a deploy URL; otherwise keep the newer-looking PR URL length tie-break as-is.
  if (!a.deployUrl && b.deployUrl) return b;
  if (a.deployUrl && !b.deployUrl) return a;
  return a;
}

function mergeRowMaps(
  ...lists: EligiblePeerRow[][]
): EligiblePeerRow[] {
  const byHandle = new Map<string, EligiblePeerRow>();
  for (const list of lists) {
    for (const row of list) {
      const key = row.handle.toLowerCase();
      byHandle.set(key, preferRow(byHandle.get(key), { ...row, handle: key }));
    }
  }
  return [...byHandle.values()].sort((a, b) => a.handle.localeCompare(b.handle));
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
    }));
}

async function loadMergedRowsFromFirestore(projectSlug: string): Promise<EligiblePeerRow[]> {
  const id = cohortId();
  const [activeHandles, entriesSnap] = await Promise.all([
    getActiveRosterHandles(id).then(toActiveHandleSet),
    submissionEntriesRef(id, projectSlug).where('merged', '==', true).get(),
  ]);

  return entriesSnap.docs
    .filter((doc) => activeHandles.has(doc.id.toLowerCase()))
    .map((doc) => {
      const data = doc.data();
      return {
        handle: doc.id.toLowerCase(),
        repo: (data.repo as string) || cohortSubmissionRepo(),
        prUrl: data.prUrl as string,
        deployUrl: (data.deployUrl as string | null) ?? null,
      };
    });
}

async function loadMergedPeerRows(projectSlug: string): Promise<EligiblePeerRow[]> {
  const mode = submissionsSource();
  if (mode === 'firestore') return loadMergedRowsFromFirestore(projectSlug);
  if (mode === 'github') return loadMergedRowsFromGithub(projectSlug);

  // github-with-fallback: union both so a partial GitHub parse cannot hide
  // valid Firestore-cached submissions (and vice versa).
  const [fromGithub, fromFirestore] = await Promise.all([
    loadMergedRowsFromGithub(projectSlug),
    loadMergedRowsFromFirestore(projectSlug),
  ]);
  return mergeRowMaps(fromGithub, fromFirestore);
}

/** Shared peer list for a project (all voters share this; filter self after). */
const getMergedPeerRowsCached = cache(async (projectSlug: string): Promise<EligiblePeerRow[]> => {
  const cached = unstable_cache(
    async () => {
      if (!isAdminConfigured()) return [] as EligiblePeerRow[];
      return loadMergedPeerRows(projectSlug);
    },
    // v3: union github+firestore; bust stale partial peer lists
    ['merged-peer-rows-v3', cohortId(), projectSlug],
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
  const self = voterHandle.toLowerCase();
  return rows.filter((row) => row.handle !== self);
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
