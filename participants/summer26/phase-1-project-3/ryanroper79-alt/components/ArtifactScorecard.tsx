'use client';

import { useEffect, useState } from 'react';
import type { ArtifactCheckResult } from '@/lib/artifact-check-types';
import { formatCheckedTime } from '@/lib/ledger-keys';

type Props = { entryKey: string; deployUrl?: string };

function scoreCell(label: string, value: number | null | undefined) {
  if (value == null) return null;
  return (
    <div className="rounded border border-ceal-line bg-ceal-white/80 px-2 py-1 text-center">
      <p className="font-mono text-[10px] uppercase text-ceal-muted">{label}</p>
      <p className="font-mono text-sm font-semibold text-ceal-mangrove">{Math.round(value)}</p>
    </div>
  );
}

export function ArtifactScorecard({ entryKey, deployUrl }: Props) {
  const [check, setCheck] = useState<ArtifactCheckResult | null>(null);

  useEffect(() => {
    if (!deployUrl) return;
    let cancelled = false;
    fetch(`/api/artifact-check?key=${encodeURIComponent(entryKey)}`)
      .then((r) => r.json())
      .then((data: ArtifactCheckResult) => {
        if (!cancelled) setCheck(data);
      })
      .catch(() => {
        if (!cancelled) setCheck({ status: 'not-yet-checked', entryKey });
      });
    return () => {
      cancelled = true;
    };
  }, [entryKey, deployUrl]);

  if (!deployUrl) return null;

  if (!check || check.status === 'not-yet-checked') {
    return (
      <div className="mt-4 rounded-md border border-dashed border-ceal-line bg-ceal-panel/50 px-3 py-2">
        <p className="font-mono text-[10px] uppercase text-ceal-muted">Artifact quality</p>
        <p className="mt-1 text-xs text-ceal-muted">not yet checked</p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-md border border-ceal-line bg-ceal-panel/50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase text-ceal-muted">Artifact quality (deploy URL)</p>
        {check.checkedAt ? (
          <p className="font-mono text-[10px] text-ceal-muted">
            last checked {formatCheckedTime(check.checkedAt)}
          </p>
        ) : null}
      </div>
      {check.lighthouse ? (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {scoreCell('Perf', check.lighthouse.performance)}
          {scoreCell('A11y', check.lighthouse.accessibility)}
          {scoreCell('BP', check.lighthouse.bestPractices)}
          {scoreCell('SEO', check.lighthouse.seo)}
        </div>
      ) : null}
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ceal-muted sm:grid-cols-3">
        {check.axeCriticalCount != null ? (
          <>
            <dt>axe critical</dt>
            <dd className="font-mono text-ceal-ink">{check.axeCriticalCount}</dd>
          </>
        ) : null}
        {check.transferWeightKb != null ? (
          <>
            <dt>transfer</dt>
            <dd className="font-mono text-ceal-ink">{Math.round(check.transferWeightKb)} KB</dd>
          </>
        ) : null}
        {check.timeToInteractiveMs != null ? (
          <>
            <dt>TTI (mobile)</dt>
            <dd className="font-mono text-ceal-ink">{Math.round(check.timeToInteractiveMs / 100) / 10}s</dd>
          </>
        ) : null}
      </dl>
    </div>
  );
}
