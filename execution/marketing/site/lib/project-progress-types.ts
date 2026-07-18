import type { ProjectOutcome } from './project-outcomes-types';

export type PeerRatingTarget = {
  handle: string;
  /** Peer app/build repo (`owner/name`) — where review issues are filed */
  repo: string;
  repoUrl: string;
  prUrl: string;
  deployUrl: string | null;
  /** GitHub issue review filed on the peer's app repo */
  reviewFiled: boolean;
  reviewIssueUrl: string | null;
  /** True when review issue body contains Vote: up */
  upvoted: boolean;
};

export type ProjectProgress = {
  projectSlug: string;
  submission: {
    merged: boolean;
    prUrl?: string;
    deployUrl?: string | null;
    repo: string;
    repoUrl: string;
    baseBranch?: string;
  };
  schedule: {
    submissionWindowStatus: 'none' | 'not-yet' | 'open' | 'closed';
    submissionOpensFormatted?: string;
    submissionClosesFormatted?: string;
    deadlineNote?: string;
  } | null;
  outcome: ProjectOutcome | null;
  reviews: {
    /** Eligible peers with merged submissions — pass-gate denominator */
    required: number;
    /** Active roster size − 1 (display only) */
    rosterPeerCount: number;
    /** Roster peers without a merged submission yet */
    awaitingMerge: number;
    /** GitHub issue reviews filed */
    writtenCompleted: number;
    /** Optional upvotes recorded (Vote: up in issue) */
    upvotesCompleted: number;
    dueNote: string;
    dueAt: string;
    dueAtFormatted: string;
    peers: PeerRatingTarget[];
    orgReposUrl: string;
    voteWeek: boolean;
    reviewWindowStatus: 'none' | 'not-yet' | 'open' | 'closed';
    reviewOpensFormatted?: string;
    reviewClosesFormatted?: string;
  } | null;
};
