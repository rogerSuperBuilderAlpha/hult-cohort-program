import type { Firestore } from 'firebase-admin/firestore';
import { cohortId } from '@/lib/cohort-config';
import { isAdminConfigured } from '@/lib/firebase/admin';
import { projectOutcomeRef } from '@/lib/firestore-paths';
import { resolveParticipantSubmission } from '@/lib/submissions-resolve-server';

import type { ProjectOutcome } from './project-outcomes-types';

export type { ProjectOutcome };

export async function getProjectOutcome(
  projectSlug: string,
  id = cohortId()
): Promise<ProjectOutcome | null> {
  if (!isAdminConfigured()) return null;

  const snap = await projectOutcomeRef(id, projectSlug).get();
  if (!snap.exists) return null;

  const data = snap.data();
  if (!data?.publishedAt) return null;

  const publishedAt = data.publishedAt?.toDate?.()?.toISOString?.() ?? null;
  if (!publishedAt) return null;

  return {
    projectSlug,
    winnerHandle: typeof data.winnerHandle === 'string' ? data.winnerHandle : null,
    up: typeof data.up === 'number' ? data.up : 0,
    down: typeof data.down === 'number' ? data.down : 0,
    tiedHandles: Array.isArray(data.tiedHandles) ? data.tiedHandles.filter(Boolean) : [],
    repo: typeof data.repo === 'string' ? data.repo : null,
    deployUrl: typeof data.deployUrl === 'string' ? data.deployUrl : null,
    prUrl: typeof data.prUrl === 'string' ? data.prUrl : null,
    publishedAt,
  };
}

export async function getPhase1Outcomes(id = cohortId()): Promise<ProjectOutcome[]> {
  const slugs = ['phase-1-project-1', 'phase-1-project-2', 'phase-1-project-3'] as const;
  const results = await Promise.all(slugs.map((slug) => getProjectOutcome(slug, id)));
  return results.filter((r): r is ProjectOutcome => r !== null);
}

export async function publishProjectOutcome(
  db: Firestore,
  id: string,
  projectSlug: string,
  payload: {
    winnerHandle: string | null;
    up: number;
    down: number;
    tiedHandles: string[];
  }
): Promise<void> {
  let repo: string | null = null;
  let deployUrl: string | null = null;
  let prUrl: string | null = null;

  if (payload.winnerHandle) {
    const submission = await resolveParticipantSubmission(projectSlug, payload.winnerHandle, id);
    if (submission) {
      repo = submission.repo ?? null;
      deployUrl = submission.deployUrl ?? null;
      prUrl = submission.prUrl ?? null;
    }
  }

  await projectOutcomeRef(id, projectSlug).set({
    winnerHandle: payload.winnerHandle,
    up: payload.up,
    down: payload.down,
    tiedHandles: payload.tiedHandles,
    repo,
    deployUrl,
    prUrl,
    publishedAt: new Date(),
  });
}
