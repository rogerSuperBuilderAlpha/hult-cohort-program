'use client';

import { useEffect, useState } from 'react';
import type { VerifyChip } from '@/lib/verify-types';
import { formatCheckedTime } from '@/lib/ledger-keys';

type VerifyEntry = {
  key: string;
  chip: VerifyChip;
  detail: string;
  checkedAt: string;
  stale: boolean;
};

const styles: Record<VerifyChip, string> = {
  green: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200',
  amber: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200',
  red: 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200',
  grey: 'bg-ceal-panel text-ceal-muted border border-dashed border-ceal-line',
};

const labels: Record<VerifyChip, string> = {
  green: 'Verified live',
  amber: 'Partial / open',
  red: 'Deploy down',
  grey: 'Unknown',
};

type Props = {
  entryKey: string;
};

export function LiveVerifyChip({ entryKey }: Props) {
  const [entry, setEntry] = useState<VerifyEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/verify')
      .then((r) => r.json())
      .then((data: { entries: VerifyEntry[] }) => {
        if (cancelled) return;
        setEntry(data.entries.find((e) => e.key === entryKey) ?? null);
      })
      .catch(() => {
        if (!cancelled) setEntry(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entryKey]);

  if (loading) {
    return (
      <span className="inline-block rounded-full bg-ceal-panel px-2.5 py-0.5 font-mono text-xs text-ceal-muted">
        checking…
      </span>
    );
  }

  if (!entry) {
    return (
      <span className="inline-block rounded-full border border-dashed border-ceal-line px-2.5 py-0.5 font-mono text-xs text-ceal-muted">
        verify unavailable
      </span>
    );
  }

  return (
    <span
      className={`inline-flex flex-wrap items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-xs ${styles[entry.chip]}`}
      title={entry.detail}
    >
      {labels[entry.chip]}
      {entry.stale ? ' · stale' : ''}
      <span className="opacity-75">· last checked {formatCheckedTime(entry.checkedAt)}</span>
    </span>
  );
}

/** Shared fetch hook for verify summary on /status */
export function useVerifySummary() {
  const [summary, setSummary] = useState<{
    green: number;
    amber: number;
    red: number;
    grey: number;
    stale: boolean;
    checkedAt?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/verify')
      .then((r) => r.json())
      .then((data: { entries: VerifyEntry[]; stale: boolean; checkedAt: string }) => {
        const counts = { green: 0, amber: 0, red: 0, grey: 0, stale: data.stale, checkedAt: data.checkedAt };
        for (const e of data.entries) counts[e.chip] += 1;
        setSummary(counts);
      })
      .catch(() => setSummary(null));
  }, []);

  return summary;
}
