'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LedgerEntry, LedgerStatus } from '@/data/ledger';
import { featuredEntries, ledgerEntries } from '@/data/ledger';

const WEEKS = [1, 2, 3] as const;

function StatusChip({ status }: { status: LedgerStatus }) {
  const styles: Record<LedgerStatus, string> = {
    merged: 'bg-emerald-100 text-emerald-900',
    open: 'bg-amber-100 text-amber-900',
    submitted: 'bg-sky-100 text-sky-900',
    'not-indexed': 'bg-ceal-panel text-ceal-muted border border-dashed border-ceal-line',
  };
  const labels: Record<LedgerStatus, string> = {
    merged: 'Merged',
    open: 'Open PR',
    submitted: 'Submitted',
    'not-indexed': 'Not yet indexed',
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-xs ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function EntryCard({ entry }: { entry: LedgerEntry }) {
  return (
    <article className="rounded-lg border border-ceal-line bg-ceal-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs uppercase text-ceal-leaf">Week {entry.week}</span>
        <StatusChip status={entry.status} />
      </div>
      <h3 className="mt-2 font-display text-xl text-ceal-mangrove">{entry.title}</h3>
      <p className="mt-1 text-sm text-ceal-muted">
        <Link href={`/p/${entry.handle}`} className="text-ceal-leaf underline focus-ring rounded">
          @{entry.handle}
        </Link>
      </p>
      <p className="mt-3 text-sm text-ceal-muted">{entry.summary}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium">
        {entry.deployUrl ? (
          <a
            href={entry.deployUrl}
            className="text-ceal-leaf underline focus-ring rounded"
            target="_blank"
            rel="noopener noreferrer"
          >
            Live deploy →
          </a>
        ) : null}
        {entry.prUrl ? (
          <a
            href={entry.prUrl}
            className="text-ceal-leaf underline focus-ring rounded"
            target="_blank"
            rel="noopener noreferrer"
          >
            {entry.prNumber ? `PR #${entry.prNumber}` : 'Evidence →'}
          </a>
        ) : null}
        {!entry.deployUrl && !entry.prUrl ? (
          <span className="text-ceal-muted">Not yet indexed</span>
        ) : null}
      </div>
    </article>
  );
}

export function WorkLedger() {
  const [week, setWeek] = useState<number | 'all'>('all');
  const [builder, setBuilder] = useState<string>('all');
  const [status, setStatus] = useState<LedgerStatus | 'all'>('all');

  const builders = useMemo(
    () => [...new Set(ledgerEntries.map((e) => e.handle))].sort(),
    [],
  );

  const filtered = useMemo(() => {
    return ledgerEntries.filter((entry) => {
      if (week !== 'all' && entry.week !== week) return false;
      if (builder !== 'all' && entry.handle !== builder) return false;
      if (status !== 'all' && entry.status !== status) return false;
      return true;
    });
  }, [week, builder, status]);

  const featured = featuredEntries();

  return (
    <div className="space-y-10">
      {featured.length > 0 ? (
        <section>
          <h2 className="font-display text-2xl text-ceal-mangrove">Operating cohort infrastructure</h2>
          <p className="mt-2 max-w-prose text-sm text-ceal-muted">
            Week 1 PM and Week 2 comms platforms the cohort runs on during the pilot.
          </p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {featured.map((entry) => (
              <li key={`${entry.handle}-w${entry.week}`}>
                <EntryCard entry={entry} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="block text-sm">
            <span className="font-mono text-xs uppercase text-ceal-muted">Week</span>
            <select
              value={week}
              onChange={(e) =>
                setWeek(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="mt-1 block w-full min-w-[120px] rounded-md border border-ceal-line bg-ceal-white px-3 py-2 text-sm focus-ring"
            >
              <option value="all">All weeks</option>
              {WEEKS.map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-mono text-xs uppercase text-ceal-muted">Builder</span>
            <select
              value={builder}
              onChange={(e) => setBuilder(e.target.value)}
              className="mt-1 block w-full min-w-[160px] rounded-md border border-ceal-line bg-ceal-white px-3 py-2 text-sm focus-ring"
            >
              <option value="all">All builders</option>
              {builders.map((h) => (
                <option key={h} value={h}>
                  @{h}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-mono text-xs uppercase text-ceal-muted">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LedgerStatus | 'all')}
              className="mt-1 block w-full min-w-[160px] rounded-md border border-ceal-line bg-ceal-white px-3 py-2 text-sm focus-ring"
            >
              <option value="all">All statuses</option>
              <option value="merged">Merged</option>
              <option value="open">Open PR</option>
              <option value="submitted">Submitted</option>
              <option value="not-indexed">Not yet indexed</option>
            </select>
          </label>
        </div>

        <p className="mt-4 font-mono text-xs text-ceal-muted">
          Showing {filtered.length} of {ledgerEntries.length} indexed entries
        </p>

        <ul className="mt-6 space-y-4">
          {filtered.map((entry) => (
            <li key={`${entry.handle}-${entry.week}-${entry.projectSlug}`}>
              <EntryCard entry={entry} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
