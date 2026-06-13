import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { programProjects } from '@/content/program';
import type { SubmissionEntry } from './submissions-types';

export async function getParticipantSubmissions(
  cohortId: string,
  githubHandle: string
): Promise<SubmissionEntry[]> {
  if (!isAdminConfigured()) return [];

  const db = getAdminDb();
  const results: SubmissionEntry[] = [];

  await Promise.all(
    programProjects.map(async (project) => {
      const doc = await db
        .collection('submissions')
        .doc(cohortId)
        .collection('projects')
        .doc(project.slug)
        .collection('entries')
        .doc(githubHandle)
        .get();

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
