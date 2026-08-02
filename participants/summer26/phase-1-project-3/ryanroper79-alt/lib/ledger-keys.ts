import type { LedgerEntry } from '@/data/ledger';

export function entryKey(entry: LedgerEntry) {
  return `${entry.handle}-w${entry.week}-${entry.projectSlug}`;
}

export function formatCheckedTime(iso: string) {
  const d = new Date(iso);
  return d.toISOString().slice(11, 16) + ' UTC';
}
