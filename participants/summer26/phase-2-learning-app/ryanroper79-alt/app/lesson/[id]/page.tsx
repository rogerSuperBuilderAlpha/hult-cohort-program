import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getRfpCase } from '@/lib/rfp-cases';
import { readLearnerSession } from '@/lib/ludwitt';
import { RfpCaseClient } from '@/components/RfpCaseClient';

type Props = { params: Promise<{ id: string }> };

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

export default async function RfpCasePage({ params }: Props) {
  const session = await readLearnerSession();
  if (!session) redirect('/');

  const { id } = await params;
  const rfp = getRfpCase(id);
  if (!rfp) notFound();

  const analysisLabel = rfp.outcome === 'won' ? 'Why we won' : 'Why we lost';

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-medium text-ceal-700 underline">
        ← RFP library
      </Link>
      <article className="rounded-2xl border border-ceal-500/20 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold">{rfp.project}</h2>
          <OutcomeBadge outcome={rfp.outcome} />
        </div>
        <p className="mt-2 text-sm text-ceal-700">
          {rfp.client} · {rfp.sector} · Submitted {rfp.submittedDate}
          {rfp.contractValue && ` · ${rfp.contractValue}`}
        </p>
        <p className="mt-4 text-ceal-900/85">{rfp.summary}</p>

        <section className="mt-8">
          <h3 className="font-semibold text-ceal-900">Strategic inclusions in our submission</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ceal-900/90">
            {rfp.strategicInclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-xl border border-ceal-500/10 bg-ceal-50/40 p-5">
          <h3 className="font-semibold text-ceal-900">{analysisLabel}</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ceal-900/90">
            {rfp.outcomeAnalysis.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-xl border border-indigo-200 bg-indigo-50/50 p-5">
          <h3 className="font-semibold text-indigo-900">Agent takeaways for future RFPs</h3>
          <ul className="mt-3 space-y-2">
            {rfp.agentTakeaways.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-indigo-900/90">
                <span className="text-indigo-500">→</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <RfpCaseClient caseId={rfp.id} outcome={rfp.outcome} quiz={rfp.quiz} />
      </article>
    </div>
  );
}
