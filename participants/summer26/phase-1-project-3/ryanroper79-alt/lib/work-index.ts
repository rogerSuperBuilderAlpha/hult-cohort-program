import { ledgerEntries } from '@/data/ledger';
import { getParticipant } from '@/data/participants';

export type WorkEntry = {
  handle: string;
  displayName: string;
  status: 'active' | 'stub';
  week: 1 | 2 | 3;
  title: string;
  summary: string;
  liveUrl?: string;
  prUrl?: string;
};

export function allWorkEntries(): WorkEntry[] {
  return ledgerEntries.map((entry) => {
    const participant = getParticipant(entry.handle);
    return {
      handle: entry.handle,
      displayName: participant?.displayName ?? entry.handle,
      status: participant?.status ?? 'stub',
      week: entry.week,
      title: entry.title,
      summary: entry.summary,
      liveUrl: entry.deployUrl,
      prUrl: entry.prUrl,
    };
  });
}
