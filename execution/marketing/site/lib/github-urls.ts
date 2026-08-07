import { cohortSubmissionRepo } from '@/lib/cohort-config';

/** Canonical `https://github.com/{owner}/{repo}` URL. */
export function githubRepoUrl(repo: string): string {
  return `https://github.com/${repo}`;
}

/** GitHub profile URL for a login handle. */
export function githubProfileUrl(handle: string): string {
  return `https://github.com/${handle}`;
}

/** Merged or open PR URL. */
export function githubPullUrl(repo: string, prNumber: number): string {
  return `https://github.com/${repo}/pull/${prNumber}`;
}

/** Cohort monorepo where submission PRs merge. */
export function cohortRepoUrl(): string {
  return githubRepoUrl(cohortSubmissionRepo());
}
