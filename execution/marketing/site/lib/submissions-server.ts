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
