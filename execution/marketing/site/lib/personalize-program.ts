import { cohortOrg, cohortSubmissionRepo } from './cohort-config';

import type { CohortStats } from './cohort-stats-types';
import { formatPeerReviewRequirement } from './cohort-stats-format';

/**
 * @param reviewTarget Per-project review load — merged submissions for this
 *   project excluding your own. Null/undefined when the project isn't known or
 *   contest state hasn't loaded; `{peerCount}` then renders as prose instead of
 *   a number. Never derive this from roster size: people who don't ship aren't
 *   reviewable.
 */
export function personalizeProgramText(
  text: string,
  handle: string,
  org = cohortOrg(),
  stats?: CohortStats | null,
  reviewTarget?: number | null
): string {
  const repo = cohortSubmissionRepo();

  let result = text
    .replaceAll('`{repo}`', `\`${repo}\``)
    .replaceAll('`{org}`', `\`${org}\``)
    .replaceAll('`{handle}`', `\`${handle}\``)
    .replaceAll('{repo}', repo)
    .replaceAll('{org}', org)
    .replaceAll('{handle}', handle)
    .replaceAll('{your-handle}', handle)
    .replaceAll('{you}', handle)
    .replaceAll('@{you}', `@${handle}`)
    .replaceAll('{team}', handle);

  const peerLabel =
    typeof reviewTarget === 'number' && reviewTarget > 0
      ? String(reviewTarget)
      : 'every peer with a merged submission';
  const cohortLabel =
    stats && stats.enrolledCount > 0 ? String(stats.enrolledCount) : 'the cohort';
  const reviewRequirement = formatPeerReviewRequirement(reviewTarget);

  result = result
    .replaceAll('{cohortSize}', cohortLabel)
    .replaceAll('{peerCount}/{peerCount}', reviewRequirement)
    .replaceAll('{peerCount}', peerLabel);

  return result;
}
