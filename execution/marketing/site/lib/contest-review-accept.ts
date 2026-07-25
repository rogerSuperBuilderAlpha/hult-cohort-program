import { parseGithubHandle } from '@/lib/firebase/github-handle';

/**
 * Accept a discovered review issue only when the GitHub author matches the
 * voter claimed in the title. Fail closed on missing/unparseable authors.
 */
export function reviewAuthorMatchesVoter(
  authorLogin: string | null | undefined,
  voterHandle: string
): boolean {
  const author = parseGithubHandle(authorLogin ?? '');
  if (!author) return false;
  return author === voterHandle.toLowerCase();
}
