'use client';

import { useVerifySummary } from '@/components/LiveVerifyChip';

export function VerifySummaryPanel() {
  const summary = useVerifySummary();

  if (!summary) {
    return <p className="text-sm text-ceal-muted">Loading live verification summary…</p>;
  }

  return (
    <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {(['green', 'amber', 'red', 'grey'] as const).map((chip) => (
        <div key={chip} className="rounded-md border border-ceal-line bg-ceal-white p-4 dark:bg-ceal-ink/20">
          <dt className="font-mono text-xs uppercase text-ceal-muted">{chip}</dt>
          <dd className="mt-1 font-display text-2xl text-ceal-mangrove dark:text-ceal-panel">
            {summary[chip]}
          </dd>
        </div>
      ))}
      <p className="col-span-full font-mono text-xs text-ceal-muted">
        Last verify pass{summary.stale ? ' (stale cache)' : ''}:{' '}
        {summary.checkedAt ? new Date(summary.checkedAt).toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : '—'}
      </p>
    </dl>
  );
}
