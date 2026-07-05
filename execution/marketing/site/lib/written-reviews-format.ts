/** Canonical GitHub issue title for a peer written review. */
export function reviewIssueTitle(reviewerHandle: string, revieweeHandle: string): string {
  return `Review by @${reviewerHandle}: @${revieweeHandle}`;
}

/** Pre-filled GitHub issue for the cohort peer-review rubric. */
export function newReviewIssueUrl(
  repo: string,
  reviewerHandle: string,
  revieweeHandle: string
): string {
  const title = encodeURIComponent(reviewIssueTitle(reviewerHandle, revieweeHandle));
  const body = encodeURIComponent(
    `## ${reviewIssueTitle(reviewerHandle, revieweeHandle)}\n` +
      `**Deployment tested:** yes/no — URL: \n` +
      `**Time spent:** ~X min\n\n` +
      `### Repo exploration (cite files)\n` +
      `- \`path/to/file\`: observation\n\n` +
      `### Rubric\n` +
      `| Dimension | Score (1-5) | Note |\n` +
      `|-----------|-------------|------|\n` +
      `| Production readiness | | |\n` +
      `| Core functionality | | |\n` +
      `| Code quality | | |\n` +
      `| Ecosystem thinking | | |\n` +
      `| UX / polish | | |\n` +
      `| **Total** | /25 | |\n\n` +
      `### One actionable suggestion\n\n` +
      `### Recommendation\n` +
      `merge-ready / needs-work / incoherent\n`
  );
  return `https://github.com/${repo}/issues/new?title=${title}&body=${body}`;
}
