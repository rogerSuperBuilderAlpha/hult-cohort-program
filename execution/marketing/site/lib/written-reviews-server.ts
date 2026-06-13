import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import type { Firestore } from 'firebase-admin/firestore';
import { issueUrlMatchesRepo, parseGithubIssueUrl } from './written-reviews-format';

const COHORT = 'fall26';

function writtenRef(db: Firestore, projectSlug: string, voterHandle: string, revieweeHandle: string) {
  return db
    .collection('peerWrittenReviews')
    .doc(COHORT)
    .collection('projects')
    .doc(projectSlug)
    .collection('voters')
    .doc(voterHandle)
    .collection('entries')
    .doc(revieweeHandle);
}

export async function getWrittenReviewsMap(
  projectSlug: string,
  voterHandle: string
): Promise<Record<string, string>> {
  if (!isAdminConfigured()) return {};

  const db = getAdminDb();
  const snap = await db
    .collection('peerWrittenReviews')
    .doc(COHORT)
    .collection('projects')
    .doc(projectSlug)
    .collection('voters')
    .doc(voterHandle)
    .collection('entries')
    .get();

  const out: Record<string, string> = {};
  for (const doc of snap.docs) {
    const url = doc.data()?.issueUrl;
    if (typeof url === 'string' && url.trim()) out[doc.id] = url.trim();
  }
  return out;
}

async function verifyIssueWithGithub(
  issueUrl: string,
  reviewerHandle: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
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

  const issue = (await res.json()) as { title?: string; state?: string; pull_request?: unknown };
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

  const db = getAdminDb();
  await writtenRef(db, projectSlug, voterHandle, revieweeHandle).set({
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
  if (!isAdminConfigured()) return false;

  const db = getAdminDb();
  const doc = await writtenRef(db, projectSlug, voterHandle, revieweeHandle).get();
  return doc.exists && Boolean(doc.data()?.issueUrl);
}
