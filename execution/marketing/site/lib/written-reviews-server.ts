import { cohortId } from '@/lib/cohort-config';
import {
  writtenReviewEntriesRef,
  writtenReviewEntryRef,
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

function writtenRef(projectSlug: string, voterHandle: string, revieweeHandle: string) {
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

async function fetchGithubIssue(
  repo: string,
  issueNumber: number
): Promise<GithubIssuePayload | null> {
  const res = await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, {
    headers: githubHeaders(),
  });
  if (!res.ok) return null;
  return (await res.json()) as GithubIssuePayload;
}

async function verifyIssueWithGithub(
  issueUrl: string,
  reviewerHandle: string,
  revieweeHandle: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    if (githubVerificationRequired()) {
      return {
        ok: false,
        error: 'Review verification is temporarily unavailable. Contact cohort@hult.edu.',
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

  const issue = await fetchGithubIssue(parsed.repo, parsed.issueNumber);
  if (!issue) {
    return { ok: false, error: 'GitHub issue not found or not accessible.' };
  }

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

/** Search peer repo for a per-reviewee review issue filed by this voter. */
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

export async function getWrittenReviewsMap(
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

  await writtenRef(projectSlug, voterHandle, revieweeHandle).set({
    issueUrl: trimmed,
    revieweeHandle,
    voterHandle,
    updatedAt: new Date(),
  });

  return { issueUrl: trimmed };
}

/** True when a written review exists. Grandfathered Firestore cache entries skip re-verification. */
export async function hasWrittenReview(
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string,
  peerRepo?: string
): Promise<boolean> {
  const doc = await writtenRef(projectSlug, voterHandle, revieweeHandle).get();
  const cachedUrl = doc.exists ? (doc.data()?.issueUrl as string | undefined) : undefined;

  if (cachedUrl?.trim()) {
    return true;
  }

  if (peerRepo) {
    const discovered = await discoverWrittenReviewOnGithub(
      peerRepo,
      voterHandle,
      revieweeHandle
    );
    if (discovered) {
      await writtenRef(projectSlug, voterHandle, revieweeHandle).set({
        issueUrl: discovered,
        revieweeHandle,
        voterHandle,
        updatedAt: new Date(),
      });
      return true;
    }
  }

  return false;
}
