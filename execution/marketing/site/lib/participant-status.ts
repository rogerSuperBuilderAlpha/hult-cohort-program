import type { CohortStats } from './cohort-stats-types';
import type { SubmissionEntry } from './submissions-types';
import type { EnrollmentInfo } from './enrollment-types';

export type ApplicationStatus =
  | 'submitted'
  | 'take-home-sent'
  | 'take-home-submitted'
  | 'admitted'
  | 'waitlisted'
  | 'rejected';

export type ParticipantMe = {
  githubHandle: string;
  cohortStats: CohortStats;
  submissions: SubmissionEntry[];
  enrollment: EnrollmentInfo;
  application: {
    id: string;
    status: ApplicationStatus;
    firstName: string;
    lastName: string;
    email: string;
    takeHomeRepoUrl?: string;
    campus: string;
    cohort: string;
  } | null;
  roster: {
    displayName: string;
    campus: string;
    roles: string[];
    active: boolean;
  } | null;
};

export function isEnrolled(me: ParticipantMe | null): boolean {
  return me?.enrollment.canAccessEnrolledUi === true;
}

export function isApplicantInFlight(me: ParticipantMe | null): boolean {
  return me?.enrollment.state === 'applicant-in-flight';
}

export function isAdmittedPendingRoster(me: ParticipantMe | null): boolean {
  return me?.enrollment.state === 'admitted-pending-roster';
}
