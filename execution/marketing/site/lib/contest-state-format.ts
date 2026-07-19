import { parseGithubHandle } from '@/lib/firebase/github-handle';

const REVIEW_TITLE_RE =
  /^review by @?([a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?):\s*@?([a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?)\b/i;

const VOTE_UP_RE = /^\s*Vote:\s*up\s*$/im;

export function parseReviewIssueTitle(
  title: string
): { voter: string; reviewee: string } | null {
  const match = title.trim().match(REVIEW_TITLE_RE);
  if (!match) return null;
  const voter = parseGithubHandle(match[1]);
  const reviewee = parseGithubHandle(match[2]);
  if (!voter || !reviewee) return null;
  return { voter, reviewee };
}

export function issueHasUpvote(body: string | null | undefined): boolean {
  return VOTE_UP_RE.test(body ?? '');
}
