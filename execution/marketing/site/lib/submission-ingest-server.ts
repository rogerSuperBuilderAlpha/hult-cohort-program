import { createHmac, timingSafeEqual } from 'crypto';
import { programProjects } from '@/content/program';
import { getCohortContext } from '@/lib/cohort-config';
import { personalizeProgramText } from '@/lib/personalize-program';
import type { CohortStats } from '@/lib/cohort-stats-types';

export type ParsedSubmissionPr = {
  projectSlug: string;
  githubHandle: string;
  repo: string;
  prNumber: number;
  prUrl: string;
  prTitle: string;
};

export function verifyGithubWebhookSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader?.startsWith('sha256=')) return false;
  const digest = createHmac('sha256', secret).update(payload).digest('hex');
  const expected = `sha256=${digest}`;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

/** GitHub may send raw JSON or `application/x-www-form-urlencoded` with a `payload` field. */
export function parseGithubWebhookPayload(rawBody: string): unknown {
  const trimmed = rawBody.trim();
  if (!trimmed) {
    throw new Error('Empty webhook body.');
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(trimmed) as unknown;
  }

  const params = new URLSearchParams(rawBody);
  const payload = params.get('payload');
  if (payload) {
    return JSON.parse(payload) as unknown;
  }

  throw new Error('Unrecognized webhook body format.');
}

const EMPTY_STATS: CohortStats = {
  cohortId: 'fall26',
  enrolledCount: 0,
  peerReviewCount: 0,
  available: true,
};

function resolveHandleFromRepo(
  repoName: string,
  repoPattern: string
): string | null {
  const pattern = repoPattern.replace('{org}/', '');

  if (pattern.includes('{handle}')) {
    const [prefix, suffix = ''] = pattern.split('{handle}');
    if (!repoName.startsWith(prefix) || !repoName.endsWith(suffix)) return null;
    const handle = repoName.slice(prefix.length, repoName.length - suffix.length);
    return handle ? handle.toLowerCase() : null;
  }

  if (repoName === pattern) return null;
  return null;
}

function resolveHandleFromTitle(prTitle: string, prTitleTemplate: string): string | null {
  const dashParts = prTitle.split('—');
  if (dashParts.length < 2) return null;
  const handle = dashParts[dashParts.length - 1]?.trim().toLowerCase();
  return handle || null;
}

export function matchMergedPullRequest(params: {
  repoFullName: string;
  prTitle: string;
  prNumber: number;
  prHtmlUrl: string;
  merged: boolean;
}): ParsedSubmissionPr | null {
  if (!params.merged) return null;

  const { org, cohortId } = getCohortContext();
  const orgPrefix = `${org}/`;
  if (!params.repoFullName.startsWith(orgPrefix)) return null;

  const repoName = params.repoFullName.slice(orgPrefix.length);
  const stats: CohortStats = { ...EMPTY_STATS, cohortId };

  for (const project of programProjects) {
    const pattern = project.submission.repoPattern.replace('{org}/', '').split(' ')[0]!;
    let handle: string | null = null;

    if (pattern.includes('{handle}')) {
      handle = resolveHandleFromRepo(repoName, project.submission.repoPattern);
    } else if (pattern === 'roster') {
      if (repoName !== 'roster') continue;
      handle = resolveHandleFromTitle(params.prTitle, project.submission.prTitle);
    } else if (pattern === 'ecosystem-integration') {
      if (repoName !== 'ecosystem-integration') continue;
      handle = resolveHandleFromTitle(params.prTitle, project.submission.prTitle);
    } else {
      continue;
    }

    if (!handle) continue;

    const expectedTitle = personalizeProgramText(
      project.submission.prTitle,
      handle,
      org,
      stats
    );
    if (params.prTitle.trim() !== expectedTitle.trim()) continue;

    return {
      projectSlug: project.slug,
      githubHandle: handle,
      repo: params.repoFullName,
      prNumber: params.prNumber,
      prUrl: params.prHtmlUrl,
      prTitle: params.prTitle,
    };
  }

  return null;
}

export type SubmissionEntryWrite = {
  githubHandle: string;
  repo: string;
  prNumber: number;
  prUrl: string;
  prTitle: string;
  merged: boolean;
  mergedAt: Date;
  deployUrl: string | null;
  source: 'webhook' | 'reconcile';
};

export function buildSubmissionEntry(
  parsed: ParsedSubmissionPr,
  mergedAt: Date,
  source: 'webhook' | 'reconcile'
): SubmissionEntryWrite {
  return {
    githubHandle: parsed.githubHandle,
    repo: parsed.repo,
    prNumber: parsed.prNumber,
    prUrl: parsed.prUrl,
    prTitle: parsed.prTitle,
    merged: true,
    mergedAt,
    deployUrl: null,
    source,
  };
}
