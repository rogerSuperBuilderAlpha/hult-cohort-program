export type SubmissionEntry = {
  projectSlug: string;
  merged: boolean;
  prUrl: string;
  prTitle?: string;
  deployUrl?: string | null;
  mergedAt?: string;
};
