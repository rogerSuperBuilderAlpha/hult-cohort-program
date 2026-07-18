/**
 * Resolve participant submissions from GitHub (canonical source).
 */

import { cohortId } from '@/lib/cohort-config';
import { getMergedSubmissionForHandle } from '@/lib/github-cohort-server';
import type { SubmissionEntry } from '@/lib/submissions-types';

export type ResolvedSubmission = {
  merged: boolean;
  prUrl?: string;
  prTitle?: string;
  deployUrl?: string | null;
  mergedAt?: string;
  repo: string;
  source: 'github';
};

export async function resolveParticipantSubmission(
  projectSlug: string,
  githubHandle: string,
  cohort: string = cohortId()
): Promise<ResolvedSubmission | null> {
  const row = await getMergedSubmissionForHandle(cohort, projectSlug, githubHandle);
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
