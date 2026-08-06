import Link from 'next/link';
import { readSession } from '@/lib/ludwitt/session';
import { dashboardMetrics, listOpportunities } from '@/lib/db/store';

export default async function DashboardPage() {
  const session = await readSession();
  const metrics = dashboardMetrics();
  const recent = listOpportunities().slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-ceal-500/20 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-ceal-900">Bid Manager dashboard</h2>
        <p className="mt-2 text-sm text-ceal-800/80">
          Target: <strong>35% win rate in 18 months</strong> by bidding half as often. Headline metrics in priority order:
        </p>
        {!session && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Launch from Ludwitt/Hult to score opportunities and emit platform events.
          </p>
        )}
        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-ceal-50 p-4">
            <dt className="text-xs font-semibold uppercase text-ceal-600">1 · Debrief completeness</dt>
            <dd className="text-3xl font-bold text-ceal-900">{metrics.debriefCompletenessPct}%</dd>
          </div>
          <div className="rounded-xl bg-ceal-50 p-4">
            <dt className="text-xs font-semibold uppercase text-ceal-600">2 · Bids declined</dt>
            <dd className="text-3xl font-bold text-ceal-900">{metrics.bidsDeclined}</dd>
          </div>
          <div className="rounded-xl bg-ceal-50 p-4">
            <dt className="text-xs font-semibold uppercase text-ceal-600">3 · Win rate (submitted)</dt>
            <dd className="text-3xl font-bold text-ceal-900">{metrics.winRateOnSubmittedPct}%</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h3 className="font-semibold">Recent opportunities</h3>
        <ul className="mt-3 space-y-2">
          {recent.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>{o.title}</span>
              <span className="text-ceal-700">
                {o.relevanceScore}% relevant · {o.status}
                {session && (
                  <>
                    {' '}
                    ·{' '}
                    <Link href={`/opportunities/${o.id}`} className="underline">
                      Open
                    </Link>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 text-sm">
        <h3 className="font-semibold text-indigo-900">Week 4 scope shipped</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-indigo-900/90">
          <li>Finder — IDB, IDB plans, CCREEE, Caribbean Export, CDB, GCF source registry</li>
          <li>Qualifier — hard gates + weighted dimensions via pure functions + Vitest</li>
          <li>Ludwitt — JWT launch, <code>qualification.scored</code> primary event</li>
          <li>Assembler — week 5+ (requires verified corporate data pack)</li>
        </ul>
      </section>
    </div>
  );
}
