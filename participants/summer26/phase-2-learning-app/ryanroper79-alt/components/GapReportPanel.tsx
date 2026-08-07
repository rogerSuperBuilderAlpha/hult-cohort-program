import type { GapReportRow } from '@/lib/bidmanager/gap-report';

type Props = {
  rows: GapReportRow[];
  summary: {
    totalGaps: number;
    mandatoryGaps: number;
    unverifiedRequirements: number;
  };
};

export function GapReportPanel({ rows, summary }: Props) {
  if (rows.length === 0) {
    return (
      <section className="mt-6 rounded-xl border border-green-200 bg-green-50/50 p-4 text-sm">
        <h3 className="font-semibold text-green-900">Gap report</h3>
        <p className="mt-1 text-green-800">No evidence gaps — all requirements have full coverage in the library.</p>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50/40 p-4">
      <h3 className="font-semibold text-amber-950">Gap report</h3>
      <p className="mt-1 text-sm text-amber-900/90">
        {summary.totalGaps} gap{summary.totalGaps !== 1 ? 's' : ''} · {summary.mandatoryGaps} mandatory ·{' '}
        {summary.unverifiedRequirements} unverified extraction{summary.unverifiedRequirements !== 1 ? 's' : ''}
      </p>
      <ol className="mt-4 space-y-3">
        {rows.map((row, i) => (
          <li key={row.requirementId} className="rounded-lg border border-amber-200/60 bg-white p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-ceal-600">#{i + 1}</span>
              <span className="rounded bg-ceal-100 px-2 py-0.5 text-xs font-medium text-ceal-800">{row.ref}</span>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">{row.category}</span>
              {row.isMandatory && (
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Mandatory</span>
              )}
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{row.coverage}</span>
              {!row.humanVerified && (
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">Unverified</span>
              )}
            </div>
            <p className="mt-2 text-ceal-900">{row.text}</p>
            <p className="mt-1 text-xs text-ceal-700/70">Weight {row.weightPct}% · rank {row.rankScore}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
