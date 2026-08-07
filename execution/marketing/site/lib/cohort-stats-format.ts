import type { CohortStats } from './cohort-stats-types';

export function formatPeerReviewRequirement(stats: CohortStats | null | undefined): string {
  if (!stats || stats.enrolledCount === 0) {
    return 'one review per other enrolled participant (count updates as the cohort fills)';
  }
  if (stats.peerReviewCount === 0) {
    return 'peer reviews apply once more participants are enrolled';
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
    return 'one review per other participant once the cohort is finalized';
  }
  return `${stats.peerReviewCount} reviews per project (every other enrolled participant)`;
}

export function formatCohortSizeLine(stats: CohortStats): string {
  if (!stats.available) {
    return 'Cohort enrollment updating';
  }
  if (stats.enrolledCount === 0) {
    return 'Enrollment in progress';
  }
  return `${stats.enrolledCount} enrolled`;
}
