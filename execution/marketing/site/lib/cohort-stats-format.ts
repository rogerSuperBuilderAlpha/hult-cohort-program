import type { CohortStats } from './cohort-stats-types';

/**
 * Review load is set by how many peers actually merged a submission for this
 * project — not by roster size. `reviewTarget` is that per-project count
 * (merged submissions excluding your own); pass null when it isn't known yet.
 */
export function formatPeerReviewRequirement(reviewTarget?: number | null): string {
  if (typeof reviewTarget !== 'number') {
    return 'one review per merged peer submission (count is set by how many peers ship)';
  }
  if (reviewTarget <= 0) {
    return 'no reviews due yet — no peer has merged a submission for this project';
  }
  return `${reviewTarget}/${reviewTarget}`;
}

/** ~10% drafted per winning platform × 3 winners */
export function operatorRoleCount(enrolledCount: number): number {
  if (enrolledCount <= 0) return 0;
  return Math.round(enrolledCount * 0.1) * 3;
}

export function formatPeerReviewsPerProject(): string {
  return 'one written review per merged submission — you review the peers who actually shipped, not the whole roster';
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
