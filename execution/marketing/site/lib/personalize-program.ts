import { cohortOrg } from './cohort-config';

import type { CohortStats } from './cohort-stats-types';
import { formatPeerReviewRequirement } from './cohort-stats-format';

export function personalizeProgramText(
  text: string,
  handle: string,
  org = cohortOrg(),
  stats?: CohortStats | null
): string {
  let result = text
    .replaceAll('{org}', org)
    .replaceAll('{handle}', handle)
    .replaceAll('{your-handle}', handle)
    .replaceAll('{you}', handle)
    .replaceAll('@{you}', `@${handle}`)
    .replaceAll('{team}', handle);

  const peerLabel =
    stats && stats.enrolledCount > 0
      ? String(stats.peerReviewCount)
      : 'every other enrolled participant';
  const cohortLabel =
    stats && stats.enrolledCount > 0 ? String(stats.enrolledCount) : 'the cohort';
  const reviewRequirement = formatPeerReviewRequirement(stats);

  result = result
    .replaceAll('{cohortSize}', cohortLabel)
    .replaceAll('{peerCount}/{peerCount}', reviewRequirement)
    .replaceAll('{peerCount}', peerLabel);

  return result;
}
