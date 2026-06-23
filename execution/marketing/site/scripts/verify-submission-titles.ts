/**
 * Verify resilient PR title matching for webhook ingestion.
 * Usage: npx tsx scripts/verify-submission-titles.ts
 */

import { extractDeployUrl, matchMergedPullRequest } from '../lib/submission-ingest-server';
import {
  normalizeSubmissionTitle,
  resolveHandleFromSubmissionTitle,
  submissionTitlesMatch,
} from '../lib/submission-title-match';

process.env.COHORT_ID = process.env.COHORT_ID || 'summer26';
process.env.NEXT_PUBLIC_COHORT_REPO =
  process.env.NEXT_PUBLIC_COHORT_REPO || 'rogerSuperBuilderAlpha/hult-cohort-program';
process.env.NEXT_PUBLIC_COHORT_ORG =
  process.env.NEXT_PUBLIC_COHORT_ORG || 'rogerSuperBuilderAlpha';

const REPO = 'rogerSuperBuilderAlpha/hult-cohort-program';
const BASE = {
  repoFullName: REPO,
  prNumber: 42,
  prHtmlUrl: 'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/42',
  merged: true,
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

// Normalization
assert(
  submissionTitlesMatch('[Project 1] Submission - alice', '[Project 1] Submission — alice'),
  'hyphen vs em dash'
);
assert(
  submissionTitlesMatch('[Project 1] Submission – alice', '[Project 1] Submission — alice'),
  'en dash vs em dash'
);
assert(
  submissionTitlesMatch('  [Project 1] Submission  —  alice  ', '[Project 1] Submission — alice'),
  'extra whitespace'
);
assert(
  normalizeSubmissionTitle('[Project 1] Submission — alice') ===
    '[Project 1] Submission — alice',
  'canonical em dash preserved'
);

// Handle extraction
assert(resolveHandleFromSubmissionTitle('[Project 1] Submission - alice') === 'alice', 'handle from hyphen title');
assert(resolveHandleFromSubmissionTitle('[Project 1] Submission') === null, 'no handle without dash');
assert(resolveHandleFromSubmissionTitle('[Project 1] Submission — invalid handle!') === null, 'invalid handle rejected');

// Full matcher
const variants = [
  '[Project 1] Submission — alice',
  '[Project 1] Submission - alice',
  '[Project 1] Submission – alice',
  '  [Project 1] Submission — alice  ',
];

for (const prTitle of variants) {
  const result = matchMergedPullRequest({ ...BASE, prTitle });
  assert(result?.projectSlug === 'phase-1-project-1', `match project for "${prTitle}"`);
  assert(result?.githubHandle === 'alice', `match handle for "${prTitle}"`);
}

const wrongProject = matchMergedPullRequest({
  ...BASE,
  prTitle: '[Project 99] Submission — alice',
});
assert(wrongProject === null, 'wrong project prefix ignored');

const wrongRepo = matchMergedPullRequest({
  ...BASE,
  repoFullName: 'other-org/other-repo',
  prTitle: '[Project 1] Submission — alice',
});
assert(wrongRepo === null, 'wrong repo ignored');

const notMerged = matchMergedPullRequest({
  ...BASE,
  prTitle: '[Project 1] Submission — alice',
  merged: false,
});
assert(notMerged === null, 'unmerged PR ignored');

process.env.ALLOW_LEGACY_MAIN_SUBMISSIONS = 'false';
const wrongBase = matchMergedPullRequest({
  ...BASE,
  prTitle: '[Project 1] Submission — alice',
  baseRef: 'main',
});
assert(wrongBase === null, 'main base rejected when legacy disabled');

const correctBase = matchMergedPullRequest({
  ...BASE,
  prTitle: '[Project 1] Submission — alice',
  baseRef: 'projects/summer26/phase-1-project-1',
});
assert(correctBase?.projectSlug === 'phase-1-project-1', 'project branch base accepted');

process.env.ALLOW_LEGACY_MAIN_SUBMISSIONS = 'true';
const legacyMain = matchMergedPullRequest({
  ...BASE,
  prTitle: '[Project 1] Submission — alice',
  baseRef: 'main',
});
assert(legacyMain?.projectSlug === 'phase-1-project-1', 'legacy main base accepted when enabled');

assert(
  extractDeployUrl('Production URL: https://app.example.com') === 'https://app.example.com',
  'deploy url inline'
);
assert(
  extractDeployUrl('**Production URL**\nhttps://app.example.com') === 'https://app.example.com',
  'deploy url on next line'
);
assert(extractDeployUrl('no url here') === null, 'no deploy url');

console.log('All submission title checks passed.');
