import { parseGithubHandle } from '@/lib/firebase/github-handle';

/**
 * Collapse whitespace and normalize dash *separators* to em dash for comparison.
 * ASCII hyphens inside tokens are preserved (GitHub handles like `paramjeet-singh-neu`).
 */
export function normalizeSubmissionTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, ' ')
    // Unicode dashes → em dash (separator glyphs)
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '—')
    // Spaced ASCII hyphen used as a separator: "Submission - handle"
    .replace(/\s+-\s+/g, ' — ')
    .replace(/\s*—\s*/g, ' — ')
    .toLowerCase();
}

export function submissionTitlesMatch(actual: string, expected: string): boolean {
  return normalizeSubmissionTitle(actual) === normalizeSubmissionTitle(expected);
}

/** Extract GitHub handle from the segment after the final dash separator. */
export function resolveHandleFromSubmissionTitle(prTitle: string): string | null {
  const normalized = normalizeSubmissionTitle(prTitle);
  const dashParts = normalized.split('—');
  if (dashParts.length < 2) return null;
  // Allow trailing notes: "joes9987 (eudapm)"
  const raw = (dashParts[dashParts.length - 1] ?? '').trim().replace(/\s*\([^)]*\)\s*$/g, '');
  return parseGithubHandle(raw);
}
