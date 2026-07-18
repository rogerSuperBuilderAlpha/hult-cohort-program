import type { PeerRatingTarget } from '@/lib/project-progress-types';
import { githubRepoUrl } from '@/lib/github-urls';

export type EligiblePeerRow = {
  handle: string;
  repo: string;
  prUrl: string;
  deployUrl: string | null;
};

/** Merge contest reviews onto eligible peer rows for the progress UI. */
export function mergePeerProgress(
  rows: EligiblePeerRow[],
  reviews: Record<string, { issueUrl: string; upvoted: boolean }>
): PeerRatingTarget[] {
  return rows.map((row) => {
    const review = reviews[row.handle] ?? null;
    return {
      handle: row.handle,
      repo: row.repo,
      repoUrl: githubRepoUrl(row.repo),
      prUrl: row.prUrl,
      deployUrl: row.deployUrl,
      reviewFiled: review !== null,
      reviewIssueUrl: review?.issueUrl ?? null,
      upvoted: review?.upvoted === true,
    };
  });
}
