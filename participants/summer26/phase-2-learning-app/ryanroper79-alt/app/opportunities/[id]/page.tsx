import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { readSession } from '@/lib/ludwitt/session';
import { getOpportunity } from '@/lib/db/store';
import { QualifyForm } from '@/components/QualifyForm';
import { loadQualConfig } from '@/lib/bidmanager/config';

type Props = { params: Promise<{ id: string }> };

export default async function OpportunityPage({ params }: Props) {
  const session = await readSession();
  if (!session) redirect('/');

  const { id } = await params;
  const opp = getOpportunity(id);
  if (!opp) notFound();

  const config = loadQualConfig();
  const isPlan = opp.stage === 'plan';

  return (
    <div className="space-y-6">
      <Link href="/finder" className="text-sm text-ceal-700 underline">← Finder</Link>
      <article className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">{opp.title}</h2>
        <p className="mt-2 text-sm text-ceal-700">
          {opp.funder} · {opp.country} · {opp.sector} · {opp.stage.toUpperCase()}
        </p>
        <p className="mt-1 text-sm">Value: ${opp.estimatedValueUsd.toLocaleString()} USD</p>
        <p className="mt-4 text-sm">{opp.rawText}</p>
        <p className="mt-3 rounded-lg bg-ceal-50 p-3 text-sm">
          Relevance: <strong>{opp.relevanceScore}%</strong> — {opp.relevanceRationale}
        </p>

        {opp.qualification && (
          <div className="mt-6 rounded-xl border border-ceal-500/20 bg-ceal-50/50 p-4 text-sm">
            <h3 className="font-semibold">Bid / no-bid memo</h3>
            <p className="mt-1">Score: {opp.qualification.totalScore} · Recommendation: {opp.qualification.recommendation}</p>
            {opp.qualification.hardFailReason && (
              <p className="mt-1 text-red-800">Hard gate: {opp.qualification.hardFailReason}</p>
            )}
            <ul className="mt-2 list-disc pl-5">
              {opp.qualification.memo.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        {isPlan ? (
          <p className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            Qualifier blocked — procurement plan stage. Add to relationship watchlist; who at {opp.issuingBody} should CEAL engage before publish?
          </p>
        ) : (
          <QualifyForm opportunityId={opp.id} initialScores={opp.qualification?.dimensionScores} />
        )}
      </article>
      <p className="text-xs text-ceal-700/70">
        Bands: ≥{config.bands.bidMin} bid · {config.bands.partnerMin}–{config.bands.bidMin - 1} partner only · &lt;{config.bands.partnerMin} no-bid
        (config {config.version}, reviewed {config.lastReviewed})
      </p>
    </div>
  );
}
