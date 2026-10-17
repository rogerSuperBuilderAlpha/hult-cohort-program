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

export function formatPeerReviewsPerProject(): string {
  return 'one written review per merged submission — you review the peers who actually shipped, not the whole roster';
}
