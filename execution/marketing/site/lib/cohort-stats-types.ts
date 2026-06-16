export type CohortStats = {
  cohortId: string;
  enrolledCount: number;
  /** Display metric: enrolled − 1. Pass gates use eligible merged peers, not this value. */
  peerReviewCount: number;
  /** False when Firestore could not be read — do not show "0 enrolled" as fact */
  available: boolean;
};
