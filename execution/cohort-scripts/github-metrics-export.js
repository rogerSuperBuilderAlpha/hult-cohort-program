#!/usr/bin/env node
/**
 * Export GitHub org metrics for cohort dashboard.
 * Requires GITHUB_TOKEN with read:org, repo scope.
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_... node github-metrics-export.js hult-cohort-fall26-boston > metrics.json
 */

const org = process.argv[2];
if (!org) {
  console.error('Usage: GITHUB_TOKEN=... node github-metrics-export.js <org>');
  process.exit(1);
}

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN required');
  process.exit(1);
}

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

const reviewLabel = 'Review by @';

async function main() {
  const repos = await gh(`/orgs/${org}/repos?per_page=100&type=public`);
  const students = {};
  let totalReviews = 0;

  for (const repo of repos) {
    if (!repo.name.match(/^(pm|comms|showcase)-/)) continue;
    const issues = await gh(`/repos/${org}/${repo.name}/issues?state=all&per_page=100`);
    for (const issue of issues) {
      if (!issue.title?.startsWith('Review by @')) continue;
      const m = issue.title.match(/Review by @(\S+)/);
      if (!m) continue;
      const reviewer = m[1];
      students[reviewer] = students[reviewer] || { reviews: 0, repos: new Set() };
      students[reviewer].reviews++;
      students[reviewer].repos.add(repo.name);
      totalReviews++;
    }
  }

  const summary = Object.entries(students).map(([handle, data]) => ({
    handle,
    reviews: data.reviews,
    repos_reviewed: data.repos.size,
  }));

  console.log(
    JSON.stringify(
      {
        org,
        exported_at: new Date().toISOString(),
        total_reviews_found: totalReviews,
        students: summary,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
