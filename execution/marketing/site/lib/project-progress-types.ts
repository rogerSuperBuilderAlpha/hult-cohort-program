export type PeerRating = 'up' | 'down';

export type PeerRatingTarget = {
  handle: string;
  repo: string;
  repoUrl: string;
  prUrl: string;
  deployUrl: string | null;
  /** GitHub issue review filed on peer repo */
  reviewFiled: boolean;
  reviewIssueUrl: string | null;
  /** Private 👍/👎 after written review */
  rated: boolean;
  myRating: PeerRating | null;
};

export type ProjectProgress = {
  projectSlug: string;
  submission: {
    merged: boolean;
    prUrl?: string;
    deployUrl?: string | null;
    repo: string;
    repoUrl: string;
  };
  reviews: {
    required: number;
    /** GitHub issue reviews filed */
    writtenCompleted: number;
    /** Private thumbs up/down submitted */
    ratingsCompleted: number;
    dueNote: string;
    peers: PeerRatingTarget[];
    orgReposUrl: string;
    voteWeek: boolean;
    /** When GITHUB_TOKEN is set, issue URLs are verified via GitHub API */
    githubVerification: boolean;
  } | null;
};
