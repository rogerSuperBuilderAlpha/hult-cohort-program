import { COHORT_REPO_SLUG } from './github-repo';
import type { Evidence } from './types';

/**
 * GitHub reads. Server-side only — this module must never be imported from a client
 * component, because GITHUB_TOKEN is not a NEXT_PUBLIC_ value and must not ship to a
 * browser.
 *
 * Scope discipline, per the consent screen: commit messages, PR titles, filenames and
 * branch names. **Never file contents. Never private repos.** The consent screen promises
 * exactly that, so the code may not quietly read more than the promise.
 */

/** Re-exported so existing server-side callers keep their import site. */
export const COHORT_REPO = COHORT_REPO_SLUG;

const API = 'https://api.github.com';

export type GitHubPull = {
  number: number;
  title: string;
  state: 'open' | 'closed';
  merged_at: string | null;
  created_at: string;
  updated_at: string;
  user: { login: string } | null;
  head: { ref: string } | null;
};

export type SyncFailure =
  | { kind: 'rate_limited'; resetAt: Date | null }
  | { kind: 'unreachable' };

export type SyncResult<T> = { ok: true; data: T } | { ok: false; failure: SyncFailure };

/**
 * Unauthenticated GitHub is 60 req/hr **per IP**, and Vercel egresses from shared IPs —
 * so the logged-out pre-index would burn through the budget on someone else's traffic.
 * A token (no scopes needed, public data only) raises it to 5,000/hr.
 *
 * Optional on purpose: without it the pre-index still works, just fragile. Never fatal.
 */
function headers(): HeadersInit {
  const h: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`;
  return h;
}

/**
 * Never throws. A sensing failure must degrade, never block the board — CRUD works with
 * GitHub entirely absent, and that's the first non-negotiable.
 */
async function get<T>(path: string, revalidate: number): Promise<SyncResult<T>> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: headers(),
      next: { revalidate },
    });

    if (res.status === 403 || res.status === 429) {
      const reset = res.headers.get('x-ratelimit-reset');
      return {
        ok: false,
        failure: { kind: 'rate_limited', resetAt: reset ? new Date(Number(reset) * 1000) : null },
      };
    }

    if (!res.ok) return { ok: false, failure: { kind: 'unreachable' } };

    return { ok: true, data: (await res.json()) as T };
  } catch {
    // Malformed JSON, DNS, timeout — all the same to the caller: degrade and say so.
    return { ok: false, failure: { kind: 'unreachable' } };
  }
}

/**
 * Every PR in the public cohort repo. One request returns 100, which covers the cohort
 * today and is why the pre-index is ~1–2 API calls rather than one per member.
 *
 * Cached for 15 minutes: the product polls rather than using webhooks (a stated
 * limitation), so there is no point asking GitHub more often than the lag we admit to.
 */
export async function fetchCohortPulls(): Promise<SyncResult<GitHubPull[]>> {
  return get<GitHubPull[]>(`/repos/${COHORT_REPO}/pulls?state=all&per_page=100`, 900);
}

/** Files a PR touched. Filenames only — never contents. */
export async function fetchPullFiles(number: number): Promise<SyncResult<{ filename: string }[]>> {
  return get<{ filename: string }[]>(`/repos/${COHORT_REPO}/pulls/${number}/files?per_page=100`, 900);
}

export type GitHubCommit = {
  sha: string;
  commit: { message: string; author: { date: string } | null };
};

/**
 * One PR's commits — messages and timestamps only, never diffs or file contents.
 *
 * This stays inside the consent screen's scope ("commit messages, PR titles, filenames
 * and branch names") and it's what recipe extraction reads: the messages are the story
 * of the fight, and first→last timestamp is the honest span of it. Cached like the
 * pulls list — extraction is a rare explicit tap, not a poll.
 */
export async function fetchPullCommits(number: number): Promise<SyncResult<GitHubCommit[]>> {
  return get<GitHubCommit[]>(`/repos/${COHORT_REPO}/pulls/${number}/commits?per_page=100`, 900);
}

/**
 * Build one member's evidence from the repo's PRs. Facts only — this is what the landing
 * page may show about someone who has never opted into anything, because merged PRs are
 * public record.
 */
export function evidenceFor(pulls: GitHubPull[], files: string[] = []): Evidence {
  const prNumbers = pulls.map((p) => p.number).sort((a, b) => a - b);

  const times = pulls.map((p) => new Date(p.created_at).getTime()).filter((t) => !Number.isNaN(t));
  const spanHours =
    times.length > 1 ? (Math.max(...times) - Math.min(...times)) / 3_600_000 : null;

  return {
    // The PR list gives no commit count without an extra call per PR; a PR is the unit of
    // work here, and inflating this with a guess would make the receipt a lie.
    commits: 0,
    prNumbers,
    files,
    spanHours,
  };
}

/** Group PRs by author login, lowercased — GitHub logins are case-insensitive. */
export function byAuthor(pulls: GitHubPull[]): Map<string, GitHubPull[]> {
  const map = new Map<string, GitHubPull[]>();
  for (const pull of pulls) {
    const login = pull.user?.login;
    if (!login) continue;
    const key = login.toLowerCase();
    map.set(key, [...(map.get(key) ?? []), pull]);
  }
  return map;
}
