import { isAdminConfigured } from '@/lib/firebase/admin';
import { cohortId } from '@/lib/cohort-config';
import { submissionEntryRef } from '@/lib/firestore-paths';
import {
  buildSubmissionEntry,
  matchMergedPullRequest,
  type ParsedSubmissionPr,
} from '@/lib/submission-ingest-server';

export async function upsertSubmissionEntry(
  parsed: ParsedSubmissionPr,
  mergedAt: Date,
  source: 'webhook' | 'reconcile',
  prBody?: string | null
): Promise<void> {
  const entry = buildSubmissionEntry(parsed, mergedAt, source, prBody);
  const ref = submissionEntryRef(cohortId(), parsed.projectSlug, parsed.githubHandle);

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
  prBody?: string | null;
  merged: boolean;
  mergedAt: Date;
  source: 'webhook' | 'reconcile';
}): Promise<{ ingested: boolean; projectSlug?: string; handle?: string }> {
  if (!isAdminConfigured()) {
    throw new Error('Admin SDK not configured');
  }

  const parsed = matchMergedPullRequest(params);
  if (!parsed) return { ingested: false };

  await upsertSubmissionEntry(parsed, params.mergedAt, params.source, params.prBody);
  return {
    ingested: true,
    projectSlug: parsed.projectSlug,
    handle: parsed.githubHandle,
  };
}
