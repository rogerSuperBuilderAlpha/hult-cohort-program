export type ProjectOutcome = {
  projectSlug: string;
  winnerHandle: string | null;
  up: number;
  down: number;
  tiedHandles: string[];
  repo: string | null;
  deployUrl: string | null;
  prUrl: string | null;
  publishedAt: string;
};
