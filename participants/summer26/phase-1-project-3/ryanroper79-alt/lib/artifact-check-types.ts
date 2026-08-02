/** Client-safe artifact check types — scores apply to deploy URLs, not people. */

export type ArtifactCheckStatus = 'checked' | 'not-yet-checked';

export type ArtifactCheckResult = {
  status: ArtifactCheckStatus;
  entryKey: string;
  deployUrl?: string;
  checkedAt?: string;
  lighthouse?: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  };
  axeCriticalCount?: number | null;
  transferWeightKb?: number | null;
  timeToInteractiveMs?: number | null;
  note?: string;
};
