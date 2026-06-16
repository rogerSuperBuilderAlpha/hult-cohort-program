/** Client-safe enrollment types — keep in sync with enrollment-server.ts */

export type EnrollmentState =
  | 'signed-out'
  | 'signed-in'
  | 'applicant'
  | 'applicant-in-flight'
  | 'admitted-pending-roster'
  | 'enrolled'
  | 'inactive';

export type EnrollmentInfo = {
  state: EnrollmentState;
  /** True when participant APIs (progress, reviews, votes) should succeed */
  canAccessParticipantApis: boolean;
  /** True when enrolled UI (dashboard, project panels) should render */
  canAccessEnrolledUi: boolean;
};
