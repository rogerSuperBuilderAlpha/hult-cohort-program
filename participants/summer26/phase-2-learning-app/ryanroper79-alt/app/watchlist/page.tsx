import Link from 'next/link';
import { listOpportunities } from '@/lib/db/store';

export default function WatchlistPage() {
  const plans = listOpportunities().filter((o) => o.stage === 'plan');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Procurement plan watchlist</h2>
        <p className="text-sm text-ceal-800/80">
          Stage = plan — not qualified yet. Action: relationship building before RFP publishes (90 / 30-day reminders in week 5).
        </p>
      </div>
      {plans.length === 0 ? (
        <p className="text-sm text-ceal-700">No plan-stage records. Poll Finder or check IDB procurement plans feed.</p>
      ) : (
        plans.map((o) => (
          <article key={o.id} className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
            <h3 className="font-semibold">{o.title}</h3>
            <p className="mt-1 text-sm">{o.funder} · {o.country}</p>
            {o.expectedBidDate && (
              <p className="mt-2 text-sm font-medium text-amber-900">Expected bid date: {o.expectedBidDate}</p>
            )}
            <p className="mt-2 text-sm text-ceal-800/80">{o.rawText}</p>
            <Link href={`/opportunities/${o.id}`} className="mt-3 inline-block text-sm underline">
              View (watchlist only — qualifier blocked)
            </Link>
          </article>
        ))
      )}
    </div>
  );
}
