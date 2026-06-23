import { programProjects } from '@/content/program';
import { isAdminConfigured } from '@/lib/firebase/admin';
import { getParticipantSubmissionsResolved } from '@/lib/submissions-resolve-server';
import type { SubmissionEntry } from './submissions-types';

export async function getParticipantSubmissions(
  cohortId: string,
  githubHandle: string
): Promise<SubmissionEntry[]> {
  if (!isAdminConfigured()) return [];
  return getParticipantSubmissionsResolved(cohortId, githubHandle);
}

/** @deprecated Use getParticipantSubmissions — kept for scripts importing programProjects path. */
export async function getParticipantSubmissionsLegacyFirestore(
  cohortId: string,
  githubHandle: string
): Promise<SubmissionEntry[]> {
  if (!isAdminConfigured()) return [];

  const { submissionEntryRef } = await import('@/lib/firestore-paths');
  const results: SubmissionEntry[] = [];

  await Promise.all(
    programProjects.map(async (project) => {
      const doc = await submissionEntryRef(cohortId, project.slug, githubHandle).get();
      if (!doc.exists) return;
      const data = doc.data()!;
      results.push({
        projectSlug: project.slug,
        merged: data.merged === true,
        prUrl: data.prUrl,
        prTitle: data.prTitle,
        deployUrl: data.deployUrl ?? null,
        mergedAt: data.mergedAt?.toDate?.()?.toISOString?.() ?? undefined,
      });
    })
  );

  return results.sort(
    (a, b) =>
      programProjects.findIndex((p) => p.slug === a.projectSlug) -
      programProjects.findIndex((p) => p.slug === b.projectSlug)
  );
}
