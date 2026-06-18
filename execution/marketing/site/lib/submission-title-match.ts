import { parseGithubHandle } from '@/lib/firebase/github-handle';

/** Collapse whitespace and normalize dash variants to em dash for comparison. */
export function normalizeSubmissionTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D-]/g, '—');
}

export function submissionTitlesMatch(actual: string, expected: string): boolean {
  return normalizeSubmissionTitle(actual) === normalizeSubmissionTitle(expected);
}

/** Extract GitHub handle from the segment after the final dash separator. */
export function resolveHandleFromSubmissionTitle(prTitle: string): string | null {
  const normalized = normalizeSubmissionTitle(prTitle);
  const dashParts = normalized.split('—');
  if (dashParts.length < 2) return null;
  return parseGithubHandle(dashParts[dashParts.length - 1] ?? '');
}
