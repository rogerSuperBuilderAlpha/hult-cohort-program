import { cohortId } from '@/lib/cohort-config';
import {
  writtenReviewEntriesRef,
  writtenReviewEntryRef,
} from '@/lib/firestore-paths';

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

function githubVerificationRequired(): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  return process.env.ALLOW_UNVERIFIED_REVIEWS?.trim() !== 'true';
}

async function verifyIssueWithGithub(
  issueUrl: string,
  reviewerHandle: string
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
      '[written-reviews] ALLOW_UNVERIFIED_REVIEWS=true — skipping GitHub issue title check (dev only).'
    );
    return { ok: true };
  }

  const parsed = parseGithubIssueUrl(issueUrl);
  if (!parsed) {
    return { ok: false, error: 'Invalid GitHub issue URL.' };
  }

  const res = await fetch(
    `https://api.github.com/repos/${parsed.repo}/issues/${parsed.issueNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'hult-cohort-platform',
      },
    }
  );

  if (!res.ok) {
    return { ok: false, error: 'GitHub issue not found or not accessible.' };
  }

  const issue = (await res.json()) as { title?: string; pull_request?: unknown };
  if (issue.pull_request) {
    return { ok: false, error: 'Link must be an issue, not a pull request.' };
  }

  const title = (issue.title ?? '').toLowerCase();
  const handle = reviewerHandle.toLowerCase();
  const validTitle =
    title.includes(`review by @${handle}`) || title.includes(`review by ${handle}`);

  if (!validTitle) {
    return {
      ok: false,
      error: `Issue title must include "Review by @${reviewerHandle}".`,
    };
  }

  return { ok: true };
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

  const githubCheck = await verifyIssueWithGithub(trimmed, voterHandle);
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

export async function hasWrittenReview(
  projectSlug: string,
  voterHandle: string,
  revieweeHandle: string
): Promise<boolean> {
  const doc = await writtenRef(projectSlug, voterHandle, revieweeHandle).get();
  return doc.exists && Boolean(doc.data()?.issueUrl);
}
