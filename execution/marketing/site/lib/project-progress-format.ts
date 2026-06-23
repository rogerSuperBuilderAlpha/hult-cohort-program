import { cohortSubmissionRepo, projectBranch } from './cohort-config';
import { githubRepoUrl } from './github-urls';

/** Browse merged/open submission PRs in the cohort monorepo by title prefix and base branch. */
export function cohortSubmissionBrowseUrl(
  repo: string,
  projectSlug: string,
  cohortId?: string
): string {
  const titlePrefix: Record<string, string> = {
    onboarding: '[Onboarding]',
    'phase-1-project-1': '[Project 1]',
    'phase-1-project-2': '[Project 2]',
    'phase-1-project-3': '[Project 3]',
    'phase-1-unification': '[Unification]',
    'phase-2-learning-app': '[P2-L1]',
    'phase-2-venture': '[P2-Venture]',
    'phase-2-open-source': '[P2-OSS]',
  };
  const prefix = titlePrefix[projectSlug];
  const base = `${githubRepoUrl(repo)}/pulls`;
  const parts = ['is:pr'];
  if (prefix) parts.push(prefix);
  if (cohortId) {
    parts.push(`base:${projectBranch(cohortId, projectSlug)}`);
  }
  const q = encodeURIComponent(parts.join(' '));
  return `${base}?q=${q}`;
}
