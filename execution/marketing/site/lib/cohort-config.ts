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

export type SubmissionsSource = 'github' | 'firestore' | 'github-with-fallback';

const DEFAULT_COHORT_REPO = 'rogerSuperBuilderAlpha/hult-cohort-program';

/** Active cohort document id in Firestore (Summer 2026 · starts July 9). */
export function cohortId(): string {
  return process.env.COHORT_ID?.trim() || 'summer26';
}

/** Upcoming cohort id for interest sign-ups (Fall 2026). */
export function nextCohortId(): string | null {
  const id =
    process.env.NEXT_PUBLIC_NEXT_COHORT_ID?.trim() || process.env.NEXT_COHORT_ID?.trim();
  return id || null;
}

/** Participant-facing cohort name from internal id. */
export function cohortDisplayLabel(id: string): string {
  switch (id) {
    case 'summer26':
      return 'Summer 2026';
    case 'fall26':
      return 'Fall 2026';
    default:
      return id;
  }
}

/** Cohort ids to scan for cross-cohort user history (comma-separated env). */
export function knownCohortIds(): string[] {
  const fromEnv = process.env.KNOWN_COHORT_IDS?.trim();
  if (fromEnv) {
    return fromEnv.split(',').map((id) => id.trim()).filter(Boolean);
  }
  return [cohortId()];
}

/** Where submission progress reads come from during migration. */
export function submissionsSource(): SubmissionsSource {
  const raw = process.env.SUBMISSIONS_SOURCE?.trim().toLowerCase();
  if (raw === 'github' || raw === 'firestore' || raw === 'github-with-fallback') {
    return raw;
  }
  return 'github-with-fallback';
}

/** Integration branch for a cohort (not used as PR base — avoids ref prefix conflicts). */
export function cohortBranch(id: string = cohortId()): string {
  return `cohorts/${id}`;
}

/** Long-lived project branch participants merge into for a cohort project. */
export function projectBranch(id: string, projectSlug: string): string {
  return `projects/${id}/${projectSlug}`;
}

/** Participant working branch for a cohort project. */
export function participantBranch(id: string, projectSlug: string, handle: string): string {
  return `participants/${id}/${projectSlug}/${handle}`;
}

/** Accept PRs merged to main during branch-model migration. */
export function allowLegacyMainSubmissions(): boolean {
  return process.env.ALLOW_LEGACY_MAIN_SUBMISSIONS?.trim() === 'true';
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
