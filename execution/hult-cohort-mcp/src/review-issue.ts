/** Pre-filled GitHub issue URL for cohort peer reviews (mirrors site lib). */
export function newReviewIssueUrl(repo: string, reviewerHandle: string): string {
  const title = encodeURIComponent(`Review by @${reviewerHandle}`);
  const body = encodeURIComponent(
    `## Review by @${reviewerHandle}\n` +
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
