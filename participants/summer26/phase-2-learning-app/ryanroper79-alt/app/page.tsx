import Link from 'next/link';
import { readLearnerSession } from '@/lib/ludwitt';
import { listRfpCases } from '@/lib/rfp-cases';
import { learningSetStats, portfolioStats } from '@/lib/rfp-analytics';
import { AgentRecommendations } from '@/components/AgentRecommendations';

function OutcomeBadge({ outcome }: { outcome: 'won' | 'lost' }) {
  const styles =
    outcome === 'won'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-red-100 text-red-800 border-red-200';
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${styles}`}>
      {outcome}
    </span>
  );
}

export default async function HomePage() {
  const session = await readLearnerSession();
  const cases = listRfpCases();
  const firm = portfolioStats();
  const learning = learningSetStats(cases);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-ceal-500/20 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-ceal-900">Request for Proposal learning engine</h2>
        <p className="mt-3 text-ceal-900/80">
          Review cEAL Green RFP submissions — what we included, why we won or lost, and what agents should add on the
          next draft. Goal: move from {firm.winRatePct}% portfolio win rate toward{' '}
          <strong>{firm.targetWinRatePct}%</strong> with fully agent-generated proposals.
        </p>
        {!session ? (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Launch from the Ludwitt/Hult directory to review cases and record learning events.
          </p>
        ) : (
          <p className="mt-4 rounded-lg bg-ceal-500/10 px-4 py-3 text-sm text-ceal-800">
            Signed in as <strong>{session.email}</strong> — select an RFP case to review.
          </p>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-ceal-50 p-3">
            <dt className="text-xs font-medium text-ceal-600">Portfolio submitted</dt>
            <dd className="text-xl font-bold text-ceal-900">{firm.totalSubmitted}</dd>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3">
            <dt className="text-xs font-medium text-emerald-700">Won</dt>
            <dd className="text-xl font-bold text-emerald-900">{firm.won}</dd>
          </div>
          <div className="rounded-lg bg-red-50 p-3">
            <dt className="text-xs font-medium text-red-700">Lost</dt>
            <dd className="text-xl font-bold text-red-900">{firm.lost}</dd>
          </div>
          <div className="rounded-lg bg-ceal-50 p-3">
            <dt className="text-xs font-medium text-ceal-600">Win rate → target</dt>
            <dd className="text-xl font-bold text-ceal-900">
              {firm.winRatePct}% → {firm.targetWinRatePct}%
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-ceal-700/70">
          Learning set: {learning.won} wins / {learning.lost} losses across {learning.totalSubmitted} reviewed cases
          below.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-ceal-900">RFP case library</h3>
        <div className="grid gap-4">
          {cases.map((rfp) => (
            <article key={rfp.id} className="rounded-xl border border-ceal-500/15 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-ceal-900">{rfp.project}</h4>
                    <OutcomeBadge outcome={rfp.outcome} />
                  </div>
                  <p className="mt-1 text-sm text-ceal-700">
                    {rfp.client} · {rfp.sector}
                  </p>
                </div>
                {rfp.contractValue && (
                  <span className="text-sm font-medium text-emerald-700">{rfp.contractValue}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-ceal-900/75">{rfp.summary}</p>
              {session ? (
                <Link
                  href={`/lesson/${rfp.id}`}
                  className="mt-4 inline-flex rounded-lg bg-ceal-700 px-4 py-2 text-sm font-medium text-white hover:bg-ceal-900"
                >
                  Review {rfp.outcome === 'won' ? 'win' : 'loss'} — strategic inclusions
                </Link>
              ) : (
                <p className="mt-4 text-sm text-ceal-700/70">Launch from Ludwitt to review.</p>
              )}
            </article>
          ))}
        </div>
      </section>

      {session && <AgentRecommendations />}
    </div>
  );
}
