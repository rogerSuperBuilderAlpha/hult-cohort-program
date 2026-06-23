export type UserHistoryEntry = {
  cohortId: string;
  projectSlug: string;
  githubHandle: string;
  repo: string;
  prNumber: number;
  prUrl: string;
  prTitle: string;
  merged: true;
  mergedAt: string;
  deployUrl: string | null;
  baseRef: string;
  headRef: string;
  authorLogin: string | null;
  phaseLabel: string;
  projectTitle: string;
};

export type UserHistorySummary = {
  githubHandle: string;
  cohortsScanned: string[];
  entries: UserHistoryEntry[];
  totalMerged: number;
};
