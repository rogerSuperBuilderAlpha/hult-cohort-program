/**
 * GitHub-first submission discovery — canonical source for merged PRs.
 * Server-only; never import from client components.
 */

import { programProjects } from '@/content/program';
import {
  cohortSubmissionRepo,
  getCohortContext,
  knownCohortIds,
  projectBranch,
} from '@/lib/cohort-config';
import { personalizeProgramText } from '@/lib/personalize-program';
import {
  extractDeployUrl,
  matchMergedPullRequest,
} from '@/lib/submission-ingest-server';
import {
  resolveHandleFromSubmissionTitle,
  submissionTitlesMatch,
} from '@/lib/submission-title-match';
import type { CohortStats } from '@/lib/cohort-stats-types';

export type GithubSubmissionRecord = {
  cohortId: string;
  projectSlug: string;
  githubHandle: string;
  repo: string;
  prNumber: number;
  prUrl: string;
  prTitle: string;
  merged: true;
  mergedAt: string;
  deployUrl: string | null;
  baseRef: string;
  headRef: string;
  authorLogin: string | null;
};

type GithubPull = {
  number: number;
  html_url: string;
  title: string;
  body: string | null;
  merged_at: string | null;
  base: { ref: string };
  head: { ref: string };
  user: { login: string } | null;
};

const EMPTY_STATS: CohortStats = {
  cohortId: 'summer26',
  enrolledCount: 0,
  peerReviewCount: 0,
  available: true,
};

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { expires: number; data: GithubSubmissionRecord[] }>();

function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN?.trim();
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'hult-cohort-platform',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function parseRepo(fullName: string): { owner: string; repo: string } | null {
  const slash = fullName.indexOf('/');
  if (slash <= 0) return null;
  return { owner: fullName.slice(0, slash), repo: fullName.slice(slash + 1) };
}

function cacheKey(cohort: string, projectSlug: string, baseRef: string): string {
  return `${cohortSubmissionRepo()}:${cohort}:${projectSlug}:${baseRef}`;
}

function titleMatchesProject(
  prTitle: string,
  projectSlug: string,
  handle: string,
  org: string,
  stats: CohortStats
): boolean {
  const project = programProjects.find((p) => p.slug === projectSlug);
  if (!project) return false;
  const expected = personalizeProgramText(project.submission.prTitle, handle, org, stats);
  return submissionTitlesMatch(prTitle, expected);
}

function pullToRecord(
  pull: GithubPull,
  cohort: string,
  projectSlug: string,
  handle: string,
  repo: string
): GithubSubmissionRecord {
  return {
    cohortId: cohort,
    projectSlug,
    githubHandle: handle,
    repo,
    prNumber: pull.number,
    prUrl: pull.html_url,
    prTitle: pull.title,
    merged: true,
    mergedAt: pull.merged_at ?? new Date().toISOString(),
    deployUrl: extractDeployUrl(pull.body),
    baseRef: pull.base.ref,
    headRef: pull.head.ref,
    authorLogin: pull.user?.login ?? null,
  };
}

async function fetchClosedPullsForBase(
  repoFullName: string,
  baseRef: string
): Promise<GithubPull[]> {
  const parsed = parseRepo(repoFullName);
  if (!parsed) return [];

  const out: GithubPull[] = [];
  for (let page = 1; page <= 5; page += 1) {
    const url = new URL(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls`
    );
    url.searchParams.set('state', 'closed');
    url.searchParams.set('base', baseRef);
    url.searchParams.set('sort', 'updated');
    url.searchParams.set('direction', 'desc');
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));

    const res = await fetch(url.toString(), { headers: githubHeaders(), next: { revalidate: 60 } });
    if (!res.ok) {
      console.warn(`[github-cohort] pulls fetch failed ${res.status} base=${baseRef}`);
      break;
    }

    const batch = (await res.json()) as GithubPull[];
    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch.filter((p) => p.merged_at));
    if (batch.length < 100) break;
  }

  return out;
}

function baseRefsForProject(cohort: string, projectSlug: string): string[] {
  const refs = [projectBranch(cohort, projectSlug)];
  if (process.env.ALLOW_LEGACY_MAIN_SUBMISSIONS?.trim() === 'true') {
    refs.push('main');
  }
  return refs;
}

/** List merged submissions for a cohort project from GitHub. */
export async function listMergedProjectSubmissions(
  cohort: string,
  projectSlug: string
): Promise<GithubSubmissionRecord[]> {
  const repo = cohortSubmissionRepo();
  const { org } = getCohortContext();
  const stats: CohortStats = { ...EMPTY_STATS, cohortId: cohort };

  const seen = new Map<string, GithubSubmissionRecord>();

  for (const baseRef of baseRefsForProject(cohort, projectSlug)) {
    const key = cacheKey(cohort, projectSlug, baseRef);
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) {
      for (const row of cached.data) seen.set(row.githubHandle, row);
      continue;
    }

    const pulls = await fetchClosedPullsForBase(repo, baseRef);
    const rows: GithubSubmissionRecord[] = [];

    for (const pull of pulls) {
      const handle = resolveHandleFromSubmissionTitle(pull.title);
      if (!handle) continue;
      if (!titleMatchesProject(pull.title, projectSlug, handle, org, stats)) continue;

      const matched = matchMergedPullRequest({
        repoFullName: repo,
        prTitle: pull.title,
        prNumber: pull.number,
        prHtmlUrl: pull.html_url,
        merged: true,
        baseRef: pull.base.ref,
        headRef: pull.head.ref,
        authorLogin: pull.user?.login ?? null,
      });
      if (!matched || matched.projectSlug !== projectSlug) continue;

      rows.push(pullToRecord(pull, cohort, projectSlug, handle, repo));
    }

    cache.set(key, { expires: Date.now() + CACHE_TTL_MS, data: rows });
    for (const row of rows) seen.set(row.githubHandle, row);
  }

  return [...seen.values()].sort((a, b) => a.githubHandle.localeCompare(b.githubHandle));
}

/** Merged submission for one participant on one project. */
export async function getMergedSubmissionForHandle(
  cohort: string,
  projectSlug: string,
  handle: string
): Promise<GithubSubmissionRecord | null> {
  const rows = await listMergedProjectSubmissions(cohort, projectSlug);
  return rows.find((r) => r.githubHandle.toLowerCase() === handle.toLowerCase()) ?? null;
}

export type UserSubmissionHistoryEntry = GithubSubmissionRecord & {
  phaseLabel: string;
  projectTitle: string;
};

/** Cross-cohort PR history for a GitHub handle. */
export async function listUserSubmissionHistory(
  handle: string,
  cohorts: string[] = knownCohortIds()
): Promise<UserSubmissionHistoryEntry[]> {
  const normalized = handle.toLowerCase();
  const out: UserSubmissionHistoryEntry[] = [];

  for (const cohort of cohorts) {
    for (const project of programProjects) {
      const row = await getMergedSubmissionForHandle(cohort, project.slug, normalized);
      if (!row) continue;
      out.push({
        ...row,
        phaseLabel: project.phaseLabel,
        projectTitle: project.title,
      });
    }
  }

  return out.sort((a, b) => {
    const cohortCmp = a.cohortId.localeCompare(b.cohortId);
    if (cohortCmp !== 0) return cohortCmp;
    const aIdx = programProjects.findIndex((p) => p.slug === a.projectSlug);
    const bIdx = programProjects.findIndex((p) => p.slug === b.projectSlug);
    return aIdx - bIdx;
  });
}

/** Invalidate in-memory cache (tests / staff scripts). */
export function clearGithubSubmissionCache(): void {
  cache.clear();
}
