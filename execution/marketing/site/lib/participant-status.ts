import type { CohortStats } from './cohort-stats-types';
import type { SubmissionEntry } from './submissions-types';

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

export function isAdmitted(me: ParticipantMe | null): boolean {
  return me?.application?.status === 'admitted' || Boolean(me?.roster?.active);
}

export function isApplicantInFlight(me: ParticipantMe | null): boolean {
  const status = me?.application?.status;
  return (
    status === 'submitted' ||
    status === 'take-home-sent' ||
    status === 'take-home-submitted'
  );
}
