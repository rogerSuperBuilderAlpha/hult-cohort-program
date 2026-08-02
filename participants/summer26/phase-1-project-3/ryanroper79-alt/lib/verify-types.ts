export type VerifyChip = 'green' | 'amber' | 'red' | 'grey';

export type EntryVerifyResult = {
  key: string;
  chip: VerifyChip;
  prState: 'merged' | 'open' | 'closed' | 'unknown';
  deployStatus: number | null;
  checkedAt: string;
  stale: boolean;
  detail: string;
};
