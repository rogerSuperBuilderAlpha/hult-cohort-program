import { FieldValue } from 'firebase-admin/firestore';
import { cohortId } from '@/lib/cohort-config';
import {
  writtenReviewEntriesRef,
  writtenReviewEntryRef,
  writtenReviewVoterRef,
} from '@/lib/firestore-paths';
import { reviewIssueTitle } from '@/lib/written-reviews-format';

function parseGithubIssueUrl(
  issueUrl: string
): { repo: string; issueNumber: number } | null {
  try {
    const u = new URL(issueUrl.trim());
    if (u.hostname !== 'github.com') return null;
    const match = u.pathname.match(/^\/([^/]+\/[^/]+)\/issues\/(\d+)\/?$/);
    if (!match) return null;
    return { repo: match[1]!, issueNumber: Number(match[2]) };
  } catch {
    return null;
  }
}

function issueUrlMatchesRepo(issueUrl: string, expectedRepo: string): boolean {
  const parsed = parseGithubIssueUrl(issueUrl);
  if (!parsed) return false;
  return parsed.repo.toLowerCase() === expectedRepo.toLowerCase();
}

function voterDocRef(projectSlug: string, voterHandle: string) {
  return writtenReviewVoterRef(cohortId(), projectSlug, voterHandle);
}

function writtenEntryRef(projectSlug: string, voterHandle: string, revieweeHandle: string) {
  return writtenReviewEntryRef(cohortId(), projectSlug, voterHandle, revieweeHandle);
}

function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN?.trim();
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'hult-cohort-platform',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function githubVerificationRequired(): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  return process.env.ALLOW_UNVERIFIED_REVIEWS?.trim() !== 'true';
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Title must be exactly `Review by @{voter}: @{reviewee}` (optional @ on handles). */
export function reviewTitleMatches(
  issueTitle: string,
  reviewerHandle: string,
  revieweeHandle: string
): boolean {
  const reviewer = reviewerHandle.toLowerCase();
  const reviewee = revieweeHandle.toLowerCase();
  const pattern = new RegExp(
    `^review by @?${escapeRegex(reviewer)}:\\s*@?${escapeRegex(reviewee)}\\b`,
    'i'
  );
  return pattern.test(issueTitle.trim());
}

type GithubIssuePayload = {
  title?: string;
  pull_request?: unknown;
  user?: { login?: string };
};

type IssueFetchResult =
  | { kind: 'ok'; issue: GithubIssuePayload }
  | { kind: 'not-found' }
  | { kind: 'auth' }
  | { kind: 'unavailable' };

async function fetchGithubIssueOnce(
  repo: string,
  issueNumber: number
): Promise<IssueFetchResult> {
  let res: Response;
  try {
    res = await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, {
      headers: githubHeaders(),
    });
  } catch {
    return { kind: 'unavailable' };
  }
  if (res.ok) return { kind: 'ok', issue: (await res.json()) as GithubIssuePayload };
  if (res.status === 401 || res.status === 403) return { kind: 'auth' };
  if (res.status === 404) return { kind: 'not-found' };
  if (res.status >= 500) return { kind: 'unavailable' };
  return { kind: 'not-found' };
}

async function fetchGithubIssue(
  repo: string,
  issueNumber: number
): Promise<IssueFetchResult> {
  const first = await fetchGithubIssueOnce(repo, issueNumber);
  if (first.kind !== 'unavailable') return first;
  await new Promise((r) => setTimeout(r, 400));
  return fetchGithubIssueOnce(repo, issueNumber);
}

async function verifyIssueWithGithub(
  issueUrl: string,
  reviewerHandle: string,
  revieweeHandle: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    if (githubVerificationRequired()) {
      console.error(
        '[written-reviews] GITHUB_TOKEN is unset in production — review verification is down. ' +
          'Set it in Vercel env (see scripts/check-production-env.mjs).'
      );
      return {
        ok: false,
        error:
          'Review verification is temporarily unavailable on our side (not your issue). ' +
          'Try again shortly; if it persists, contact cohort@hult.edu.',
      };
    }
    console.warn(
      '[written-reviews] ALLOW_UNVERIFIED_REVIEWS=true — skipping GitHub issue check (dev only).'
    );
    return { ok: true };
  }

  const parsed = parseGithubIssueUrl(issueUrl);
  if (!parsed) {
    return { ok: false, error: 'Invalid GitHub issue URL.' };
  }

  const result = await fetchGithubIssue(parsed.repo, parsed.issueNumber);
  if (result.kind === 'auth') {
    console.error(
      `[written-reviews] GitHub returned 401/403 verifying ${parsed.repo}#${parsed.issueNumber} — ` +
        'check GITHUB_TOKEN validity, repo scope, and rate-limit budget.'
    );
    return {
      ok: false,
      error:
        'Review verification is temporarily unavailable on our side (not your issue). ' +
        'Wait a minute and try again; if it persists, contact cohort@hult.edu.',
    };
  }
  if (result.kind === 'unavailable') {
    return {
      ok: false,
      error: 'GitHub is temporarily unavailable. Wait a moment and try saving again.',
    };
  }
  if (result.kind === 'not-found') {
    return {
      ok: false,
      error: 'GitHub issue not found or not accessible. Check the URL and that the issue is public.',
    };
  }
  const issue = result.issue;

  if (issue.pull_request) {
    return { ok: false, error: 'Link must be an issue, not a pull request.' };
  }

  const authorLogin = issue.user?.login?.trim().toLowerCase();
  if (!authorLogin || authorLogin !== reviewerHandle.toLowerCase()) {
    return {
      ok: false,
      error: `The issue must be opened from your GitHub account (@${reviewerHandle}).`,
    };
  }

  if (!reviewTitleMatches(issue.title ?? '', reviewerHandle, revieweeHandle)) {
    const expected = reviewIssueTitle(reviewerHandle, revieweeHandle);
    return {
      ok: false,
      error: `Issue title must be exactly "${expected}".`,
    };
  }

  return { ok: true };
}

export async function discoverWrittenReviewOnGithub(
  peerRepo: string,
  reviewerHandle: string,
  revieweeHandle: string
): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) return null;

  const titleQuery = reviewIssueTitle(reviewerHandle, revieweeHandle);
  const q = encodeURIComponent(
    `repo:${peerRepo} is:issue author:${reviewerHandle} "${titleQuery}" in:title`
  );
  const res = await fetch(`https://api.github.com/search/issues?q=${q}&per_page=5`, {
    headers: githubHeaders(),
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    items?: { html_url?: string; title?: string; user?: { login?: string } }[];
  };

  for (const item of data.items ?? []) {
    if (!item.html_url) continue;
    const author = item.user?.login?.trim().toLowerCase();
    if (author !== reviewerHandle.toLowerCase()) continue;
    if (!reviewTitleMatches(item.title ?? '', reviewerHandle, revieweeHandle)) continue;

    const verified = await verifyIssueWithGithub(item.html_url, reviewerHandle, revieweeHandle);
    if (verified.ok) return item.html_url;
  }

  return null;
}

function reviewsFromVoterData(
  data: { reviews?: unknown } | undefined
): Record<string, string> | null {
  const raw = data?.reviews;
  if (!raw || typeof raw !== 'object') return null;
  const out: Record<string, string> = {};
  for (const [handle, url] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof url === 'string' && url.trim()) out[handle] = url.trim();
  }
  return out;
}

async function loadReviewsFromEntries(
  projectSlug: string,
  voterHandle: string
): Promise<Record<string, string>> {
  const snap = await writtenReviewEntriesRef(cohortId(), projectSlug, voterHandle).get();
  const out: Record<string, string> = {};
  for (const doc of snap.docs) {
    const url = doc.data()?.issueUrl;
    if (typeof url === 'string' && url.trim()) out[doc.id] = url.trim();
  }
  return out;
}

/** One-doc read of the voter map; falls back once to legacy entry subcollection + backfill. */
export async function getWrittenReviewsMap(
  projectSlug: string,
  voterHandle: string
): Promise<Record<string, string>> {
  const voterRef = voterDocRef(projectSlug, voterHandle);
  const voterSnap = await voterRef.get();
  const fromMap = reviewsFromVoterData(voterSnap.data());
  if (fromMap) return fromMap;

  const fromEntries = await loadReviewsFromEntries(projectSlug, voterHandle);
  if (Object.keys(fromEntries).length > 0) {
    await voterRef.set(
      { reviews: fromEntries, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  }
  return fromEntries;
}

async function persistReview(
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string,
  issueUrl: string
): Promise<void> {
  const fieldPath = `reviews.${revieweeHandle}`;
  await voterDocRef(projectSlug, voterHandle).set(
    {
      [fieldPath]: issueUrl,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  // Keep legacy entry for older tooling / gradual migration.
  await writtenEntryRef(projectSlug, voterHandle, revieweeHandle).set({
    issueUrl,
    revieweeHandle,
    voterHandle,
    updatedAt: new Date(),
  });
}

export async function saveWrittenReview(
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string,
  issueUrl: string,
  expectedRepo: string
): Promise<{ issueUrl: string }> {
  const trimmed = issueUrl.trim();
  if (!issueUrlMatchesRepo(trimmed, expectedRepo)) {
    throw new Error(`Issue URL must be on the peer repo: ${expectedRepo}`);
  }

  const githubCheck = await verifyIssueWithGithub(trimmed, voterHandle, revieweeHandle);
  if (!githubCheck.ok) {
    throw new Error(githubCheck.error);
  }

  await persistReview(projectSlug, voterHandle, revieweeHandle, trimmed);
  return { issueUrl: trimmed };
}

async function dropStaleReview(
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string
): Promise<void> {
  const fieldPath = `reviews.${revieweeHandle}`;
  await voterDocRef(projectSlug, voterHandle).set(
    {
      [fieldPath]: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  try {
    await writtenEntryRef(projectSlug, voterHandle, revieweeHandle).delete();
  } catch {
    // ignore missing legacy entry
  }
}

/**
 * True when a written review exists. Uses the flat voter `reviews` map (1 doc).
 * Cached URLs are re-verified against GitHub at vote time when a token is available.
 */
export async function hasWrittenReview(
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string,
  peerRepo?: string
): Promise<boolean> {
  const map = await getWrittenReviewsMap(projectSlug, voterHandle);
  const cachedUrl = map[revieweeHandle];

  if (cachedUrl?.trim()) {
    const token = process.env.GITHUB_TOKEN?.trim();
    if (!token || !githubVerificationRequired()) return true;

    const parsed = parseGithubIssueUrl(cachedUrl);
    if (!parsed) return false;

    const result = await fetchGithubIssue(parsed.repo, parsed.issueNumber);
    if (result.kind === 'auth' || result.kind === 'unavailable') {
      return true;
    }
    if (result.kind === 'ok') {
      const issue = result.issue;
      const authorOk =
        issue.user?.login?.trim().toLowerCase() === voterHandle.toLowerCase();
      if (
        authorOk &&
        !issue.pull_request &&
        reviewTitleMatches(issue.title ?? '', voterHandle, revieweeHandle)
      ) {
        return true;
      }
    }
    await dropStaleReview(projectSlug, voterHandle, revieweeHandle);
  }

  if (peerRepo) {
    const discovered = await discoverWrittenReviewOnGithub(
      peerRepo,
      voterHandle,
      revieweeHandle
    );
    if (discovered) {
      await persistReview(projectSlug, voterHandle, revieweeHandle, discovered);
      return true;
    }
  }

  return false;
}
