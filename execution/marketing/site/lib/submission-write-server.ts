import { revalidateTag } from 'next/cache';
import { cohortId } from '@/lib/cohort-config';
import { clearGithubSubmissionCache } from '@/lib/github-cohort-server';
import { matchMergedPullRequest } from '@/lib/submission-ingest-server';

/**
 * Recognize a merged cohort submission PR and bust GitHub/contest caches.
 * Does not write Firestore — GitHub is the canonical submission source.
 */
export async function ingestMergedPullRequest(params: {
  repoFullName: string;
  prTitle: string;
  prNumber: number;
  prHtmlUrl: string;
  prBody?: string | null;
  merged: boolean;
  mergedAt: Date;
  source: 'webhook' | 'reconcile';
  baseRef?: string;
  headRef?: string;
  authorLogin?: string | null;
}): Promise<{ ingested: boolean; projectSlug?: string; handle?: string }> {
  const parsed = matchMergedPullRequest(params);
  if (!parsed) return { ingested: false };

  if (params.authorLogin?.trim()) {
    const author = params.authorLogin.trim().toLowerCase();
    const expected = parsed.githubHandle.toLowerCase();
    if (author !== expected) {
      console.warn('[submission-ingest] PR author does not match title handle', {
        authorLogin: params.authorLogin,
        titleHandle: parsed.githubHandle,
        prNumber: params.prNumber,
        prTitle: params.prTitle,
      });
      return { ingested: false };
    }
  }

  clearGithubSubmissionCache();
  const id = cohortId();
  revalidateTag(`peers:${id}:${parsed.projectSlug}`);
  revalidateTag(`contest:${id}:${parsed.projectSlug}`);

  return {
    ingested: true,
    projectSlug: parsed.projectSlug,
    handle: parsed.githubHandle,
  };
}
