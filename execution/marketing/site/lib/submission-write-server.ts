import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId } from '@/lib/cohort-config';
import {
  buildSubmissionEntry,
  matchMergedPullRequest,
  type ParsedSubmissionPr,
  type SubmissionEntryWrite,
} from '@/lib/submission-ingest-server';

export async function upsertSubmissionEntry(
  parsed: ParsedSubmissionPr,
  mergedAt: Date,
  source: 'webhook' | 'reconcile'
): Promise<void> {
  const db = getAdminDb();
  const entry = buildSubmissionEntry(parsed, mergedAt, source);
  const ref = db
    .collection('submissions')
    .doc(cohortId())
    .collection('projects')
    .doc(parsed.projectSlug)
    .collection('entries')
    .doc(parsed.githubHandle);

  await ref.set(
    {
      ...entry,
      updatedAt: new Date(),
    },
    { merge: true }
  );
}

export async function ingestMergedPullRequest(params: {
  repoFullName: string;
  prTitle: string;
  prNumber: number;
  prHtmlUrl: string;
  merged: boolean;
  mergedAt: Date;
  source: 'webhook' | 'reconcile';
}): Promise<{ ingested: boolean; projectSlug?: string; handle?: string }> {
  if (!isAdminConfigured()) {
    throw new Error('Admin SDK not configured');
  }

  const parsed = matchMergedPullRequest(params);
  if (!parsed) return { ingested: false };

  await upsertSubmissionEntry(parsed, params.mergedAt, params.source);
  return {
    ingested: true,
    projectSlug: parsed.projectSlug,
    handle: parsed.githubHandle,
  };
}

export type { SubmissionEntryWrite };
