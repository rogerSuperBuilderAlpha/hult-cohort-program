/**
 * Resolve participant submissions — GitHub-first with optional Firestore fallback.
 */

import { cohortId, cohortSubmissionRepo, submissionsSource } from '@/lib/cohort-config';
import { isAdminConfigured } from '@/lib/firebase/admin';
import { submissionEntryRef } from '@/lib/firestore-paths';
import { getMergedSubmissionForHandle } from '@/lib/github-cohort-server';
import type { SubmissionEntry } from '@/lib/submissions-types';

export type ResolvedSubmission = {
  merged: boolean;
  prUrl?: string;
  prTitle?: string;
  deployUrl?: string | null;
  mergedAt?: string;
  repo: string;
  source: 'github' | 'firestore';
};

async function fromFirestore(
  id: string,
  projectSlug: string,
  githubHandle: string
): Promise<ResolvedSubmission | null> {
  if (!isAdminConfigured()) return null;
  const doc = await submissionEntryRef(id, projectSlug, githubHandle).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    merged: data.merged === true,
    prUrl: data.prUrl as string | undefined,
    prTitle: data.prTitle as string | undefined,
    deployUrl: (data.deployUrl as string | null) ?? null,
    mergedAt: data.mergedAt?.toDate?.()?.toISOString?.(),
    repo: (data.repo as string) || cohortSubmissionRepo(),
    source: 'firestore',
  };
}

async function fromGithub(
  id: string,
  projectSlug: string,
  githubHandle: string
): Promise<ResolvedSubmission | null> {
  const row = await getMergedSubmissionForHandle(id, projectSlug, githubHandle);
  if (!row) return null;
  return {
    merged: true,
    prUrl: row.prUrl,
    prTitle: row.prTitle,
    deployUrl: row.deployUrl,
    mergedAt: row.mergedAt,
    repo: row.repo,
    source: 'github',
  };
}

export async function resolveParticipantSubmission(
  projectSlug: string,
  githubHandle: string,
  cohort: string = cohortId()
): Promise<ResolvedSubmission | null> {
  const mode = submissionsSource();

  if (mode === 'firestore') {
    return fromFirestore(cohort, projectSlug, githubHandle);
  }

  const githubRow = await fromGithub(cohort, projectSlug, githubHandle);
  if (githubRow) return githubRow;

  if (mode === 'github-with-fallback') {
    return fromFirestore(cohort, projectSlug, githubHandle);
  }

  return null;
}

export async function getParticipantSubmissionsResolved(
  cohort: string,
  githubHandle: string
): Promise<SubmissionEntry[]> {
  const { programProjects } = await import('@/content/program');
  const results: SubmissionEntry[] = [];

  await Promise.all(
    programProjects.map(async (project) => {
      const row = await resolveParticipantSubmission(project.slug, githubHandle, cohort);
      if (!row?.merged || !row.prUrl) return;
      results.push({
        projectSlug: project.slug,
        merged: true,
        prUrl: row.prUrl,
        prTitle: row.prTitle,
        deployUrl: row.deployUrl ?? null,
        mergedAt: row.mergedAt,
      });
    })
  );

  return results.sort(
    (a, b) =>
      programProjects.findIndex((p) => p.slug === a.projectSlug) -
      programProjects.findIndex((p) => p.slug === b.projectSlug)
  );
}
