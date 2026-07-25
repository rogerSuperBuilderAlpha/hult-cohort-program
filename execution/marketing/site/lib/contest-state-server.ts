/**
 * Shared GitHub contest state — submissions + review issues (+ optional Vote: up).
 * Server-only; one cached blob per project for all participants.
 */

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { cohortId, cohortSubmissionRepo } from '@/lib/cohort-config';
import { listMergedProjectSubmissions } from '@/lib/github-cohort-server';
import { loadActiveRosterHandles } from '@/lib/roster-handles-server';
import { reviewAuthorMatchesVoter } from '@/lib/contest-review-accept';
import { issueHasUpvote, parseReviewIssueTitle } from '@/lib/contest-state-format';

export type ContestSubmission = {
  handle: string;
  /** Peer app/build repo (`owner/name`) where review issues are filed */
  repo: string;
  prUrl: string;
  deployUrl: string | null;
  mergedAt: string;
  prNumber: number;
};

export type ContestReview = {
  issueUrl: string;
  upvoted: boolean;
};

export type ContestState = {
  cohortId: string;
  projectSlug: string;
  repo: string;
  submissions: ContestSubmission[];
  /** voter → reviewee → review */
  reviews: Record<string, Record<string, ContestReview>>;
  /** True when one or more GitHub Search calls failed (partial/empty reviews possible). */
  reviewsFetchDegraded: boolean;
};

export { issueHasUpvote, parseReviewIssueTitle } from '@/lib/contest-state-format';

type GithubSearchIssue = {
  html_url?: string;
  title?: string;
  body?: string | null;
  user?: { login?: string } | null;
  pull_request?: unknown;
};

type RepoSearchResult = {
  issues: GithubSearchIssue[];
  ok: boolean;
};

/** Keep Search API under ~30 req/min authenticated ceiling across peer repos. */
const SEARCH_CONCURRENCY = 3;

function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN?.trim();
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'hult-cohort-platform',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return [];
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index]!);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

async function searchReviewIssuesInRepo(repo: string): Promise<RepoSearchResult> {
  const out: GithubSearchIssue[] = [];
  const q = `repo:${repo} is:issue in:title "Review by @"`;

  for (let page = 1; page <= 5; page += 1) {
    const url = new URL('https://api.github.com/search/issues');
    url.searchParams.set('q', q);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        headers: githubHeaders(),
        next: { revalidate: 60 },
      });
    } catch (err) {
      console.warn(
        `[contest-state] issue search network error repo=${repo}`,
        err instanceof Error ? err.message : err
      );
      return { issues: out, ok: false };
    }
    if (!res.ok) {
      console.warn(`[contest-state] issue search failed ${res.status} repo=${repo}`);
      return { issues: out, ok: false };
    }

    const json = (await res.json()) as { items?: GithubSearchIssue[] };
    const items = Array.isArray(json.items) ? json.items : [];
    out.push(...items.filter((item) => !item.pull_request));
    if (items.length < 100) break;
  }

  return { issues: out, ok: true };
}

/** Discover review issues on each peer app repo (+ cohort monorepo for any legacy filings). */
async function searchReviewIssues(
  peerRepos: string[]
): Promise<{ issues: GithubSearchIssue[]; degraded: boolean }> {
  const repos = [...new Set([...peerRepos, cohortSubmissionRepo()].filter(Boolean))];
  const batches = await mapPool(repos, SEARCH_CONCURRENCY, searchReviewIssuesInRepo);
  return {
    issues: batches.flatMap((b) => b.issues),
    degraded: batches.some((b) => !b.ok),
  };
}

/** Uncached builder — use from staff scripts; request path should call fetchContestState. */
export async function buildContestState(projectSlug: string): Promise<ContestState> {
  const id = cohortId();
  const repo = cohortSubmissionRepo();
  const active = new Set((await loadActiveRosterHandles(id)).map((h) => h.toLowerCase()));

  const githubRows = await listMergedProjectSubmissions(id, projectSlug);
  const submissions: ContestSubmission[] = githubRows
    .filter((row) => active.has(row.githubHandle.toLowerCase()))
    .map((row) => ({
      handle: row.githubHandle.toLowerCase(),
      repo: row.repo,
      prUrl: row.prUrl,
      deployUrl: row.deployUrl,
      mergedAt: row.mergedAt,
      prNumber: row.prNumber,
    }))
    .sort((a, b) => a.handle.localeCompare(b.handle));

  const submissionHandles = new Set(submissions.map((s) => s.handle));
  const reviews: ContestState['reviews'] = {};

  const { issues, degraded } = await searchReviewIssues(submissions.map((s) => s.repo));
  for (const issue of issues) {
    if (!issue.html_url || !issue.title) continue;
    const parsed = parseReviewIssueTitle(issue.title);
    if (!parsed) continue;
    if (!active.has(parsed.voter) || !submissionHandles.has(parsed.reviewee)) continue;
    if (parsed.voter === parsed.reviewee) continue;

    if (!reviewAuthorMatchesVoter(issue.user?.login, parsed.voter)) continue;

    if (!reviews[parsed.voter]) reviews[parsed.voter] = {};
    // Prefer issue that has an upvote if duplicates exist
    const prev = reviews[parsed.voter][parsed.reviewee];
    const upvoted = issueHasUpvote(issue.body);
    if (prev?.upvoted && !upvoted) continue;
    reviews[parsed.voter][parsed.reviewee] = {
      issueUrl: issue.html_url,
      upvoted,
    };
  }

  return {
    cohortId: id,
    projectSlug,
    repo,
    submissions,
    reviews,
    reviewsFetchDegraded: degraded,
  };
}

const getContestStateCached = cache(async (projectSlug: string): Promise<ContestState> => {
  const cached = unstable_cache(
    () => buildContestState(projectSlug),
    ['contest-state-v3', cohortId(), projectSlug],
    { revalidate: 60, tags: [`contest:${cohortId()}:${projectSlug}`] }
  );
  return cached();
});

export async function fetchContestState(projectSlug: string): Promise<ContestState> {
  return getContestStateCached(projectSlug);
}

/** Personal review map for one voter (no cohort aggregates). */
export function reviewsForVoter(
  state: ContestState,
  voterHandle: string
): Record<string, ContestReview> {
  return state.reviews[voterHandle.toLowerCase()] ?? {};
}
