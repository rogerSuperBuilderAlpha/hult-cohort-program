/** Single source of truth for cohort identity across server, API, and scripts. */

import { cohortRepoUrl } from '@/lib/github-urls';

export type CohortContext = {
  cohortId: string;
  /** GitHub owner (user or org) — derived from submission repo when unset. */
  org: string;
  /** Full `owner/repo` where submission PRs merge (canonical cohort monorepo). */
  repo: string;
  orgUrl: string;
  repoUrl: string;
};

const DEFAULT_COHORT_REPO = 'rogerSuperBuilderAlpha/hult-cohort-program';

/** Active cohort document id in Firestore (e.g. fall26). */
export function cohortId(): string {
  return process.env.COHORT_ID?.trim() || 'fall26';
}

/** Submission target repo — all cohort PRs merge here. */
export function cohortSubmissionRepo(): string {
  return process.env.NEXT_PUBLIC_COHORT_REPO?.trim() || DEFAULT_COHORT_REPO;
}

/** GitHub owner for the submission repo (legacy `{org}` placeholder in copy). */
export function cohortOrg(): string {
  const fromEnv = process.env.NEXT_PUBLIC_COHORT_ORG?.trim();
  if (fromEnv) return fromEnv;
  const repo = cohortSubmissionRepo();
  const slash = repo.indexOf('/');
  return slash > 0 ? repo.slice(0, slash) : 'rogerSuperBuilderAlpha';
}

export function getCohortContext(): CohortContext {
  const id = cohortId();
  const repo = cohortSubmissionRepo();
  const org = cohortOrg();
  const repoUrl = cohortRepoUrl();
  return { cohortId: id, org, repo, orgUrl: repoUrl, repoUrl };
}
