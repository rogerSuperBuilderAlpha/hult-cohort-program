import { listUserSubmissionHistory } from '@/lib/github-cohort-server';
import { knownCohortIds } from '@/lib/cohort-config';
import type { UserHistorySummary } from '@/lib/history-types';

export type { UserHistorySummary } from '@/lib/history-types';

export async function getUserHistorySummary(
  githubHandle: string
): Promise<UserHistorySummary> {
  const cohortsScanned = knownCohortIds();
  const entries = await listUserSubmissionHistory(githubHandle, cohortsScanned);
  return {
    githubHandle,
    cohortsScanned,
    entries,
    totalMerged: entries.length,
  };
}
