import type { CohortStats } from './cohort-stats-types';

export function formatPeerReviewRequirement(stats: CohortStats | null | undefined): string {
  if (!stats || stats.enrolledCount === 0) {
    return 'one review per other enrolled participant (count updates as the cohort fills)';
  }
  if (stats.peerReviewCount === 0) {
    return 'peer ratings apply once more participants join';
  }
  return `${stats.peerReviewCount}/${stats.peerReviewCount}`;
}

/** ~10% drafted per winning platform × 3 winners */
export function operatorRoleCount(enrolledCount: number): number {
  if (enrolledCount <= 0) return 0;
  return Math.round(enrolledCount * 0.1) * 3;
}

export function formatPeerReviewsPerProject(stats: CohortStats): string {
  if (stats.enrolledCount <= 1) {
    return 'one review per other participant once the cohort fills';
  }
  return `${stats.peerReviewCount} reviews per project (everyone else in the cohort)`;
}

export function formatCohortSizeLine(stats: CohortStats): string {
  if (!stats.available) {
    return 'Cohort size updating';
  }
  if (stats.enrolledCount === 0) {
    return 'Cohort filling now';
  }
  return `${stats.enrolledCount} enrolled`;
}
