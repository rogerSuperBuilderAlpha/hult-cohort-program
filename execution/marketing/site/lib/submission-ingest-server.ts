import { createHmac, timingSafeEqual } from 'crypto';
import { programProjects } from '@/content/program';
import { getCohortContext } from '@/lib/cohort-config';
import { personalizeProgramText } from '@/lib/personalize-program';
import type { CohortStats } from '@/lib/cohort-stats-types';
import {
  resolveHandleFromSubmissionTitle,
  submissionTitlesMatch,
} from '@/lib/submission-title-match';

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

function extractFirstHttpsUrl(text: string): string | null {
  const match = text.match(/https:\/\/[^\s<>\]"')]+/i);
  if (!match) return null;
  return match[0].replace(/[.,;]+$/, '');
}

/** Parse deploy URL from submission PR body (Production URL / Deploy URL label). */
export function extractDeployUrl(prBody: string | null | undefined): string | null {
  if (!prBody?.trim()) return null;

  const lines = prBody.split(/\r?\n/);
  const labelPattern =
    /^\s*(?:\*\*)?(?:production\s+url|deploy(?:ment)?\s+url)(?:\*\*)?\s*:?\s*(.*)$/i;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(labelPattern);
    if (!match) continue;

    const inline = extractFirstHttpsUrl(match[1] ?? '');
    if (inline) return inline;

    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
      const line = lines[j].trim();
      if (!line) continue;
      const url = extractFirstHttpsUrl(line);
      if (url) return url;
      if (!line.match(/^[\s\-*]/)) break;
    }
  }

  return null;
}

const EMPTY_STATS: CohortStats = {
  cohortId: 'fall26',
  enrolledCount: 0,
  peerReviewCount: 0,
  available: true,
};

export function matchMergedPullRequest(params: {
  repoFullName: string;
  prTitle: string;
  prNumber: number;
  prHtmlUrl: string;
  merged: boolean;
}): ParsedSubmissionPr | null {
  if (!params.merged) return null;

  const { org, cohortId, repo: cohortRepo } = getCohortContext();
  if (params.repoFullName.toLowerCase() !== cohortRepo.toLowerCase()) return null;

  const stats: CohortStats = { ...EMPTY_STATS, cohortId };

  for (const project of programProjects) {
    const handle = resolveHandleFromSubmissionTitle(params.prTitle);
    if (!handle) continue;

    const expectedTitle = personalizeProgramText(
      project.submission.prTitle,
      handle,
      org,
      stats
    );
    if (!submissionTitlesMatch(params.prTitle, expectedTitle)) continue;

    return {
      projectSlug: project.slug,
      githubHandle: handle,
      repo: cohortRepo,
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
  source: 'webhook' | 'reconcile',
  prBody?: string | null
): SubmissionEntryWrite {
  return {
    githubHandle: parsed.githubHandle,
    repo: parsed.repo,
    prNumber: parsed.prNumber,
    prUrl: parsed.prUrl,
    prTitle: parsed.prTitle,
    merged: true,
    mergedAt,
    deployUrl: extractDeployUrl(prBody),
    source,
  };
}
