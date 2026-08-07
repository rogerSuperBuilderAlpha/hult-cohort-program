import Link from 'next/link';
import { redirect } from 'next/navigation';
import { readSession } from '@/lib/ludwitt/session';
import { listVerificationQueue, getOpportunity } from '@/lib/db/store';
import { VerifyRequirementButton } from '@/components/VerifyRequirementButton';

export default async function VerificationPage() {
  const session = await readSession();
  if (!session) redirect('/');

  const queue = listVerificationQueue().sort((a, b) => {
    const score = (r: typeof a) => (r.isMandatory ? 1000 : 0) + r.extractionConfidence * 100;
    return score(b) - score(a);
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-ceal-500/20 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-ceal-900">Human verification queue</h2>
        <p className="mt-2 text-sm text-ceal-800/80">
          AI-extracted requirements stay <code>human_verified=false</code> until confirmed here. This is the only path
          to set verification true — no API or batch override.
        </p>
        <p className="mt-3 text-sm font-medium text-ceal-700">
          {queue.length} requirement{queue.length !== 1 ? 's' : ''} awaiting review
        </p>
      </section>

      {queue.length === 0 ? (
        <p className="rounded-xl border bg-ceal-50 p-5 text-sm text-ceal-800">Queue empty — all extracted requirements verified.</p>
      ) : (
        <ul className="space-y-4">
          {queue.map((req) => {
            const opp = getOpportunity(req.opportunityId);
            return (
              <li key={req.id} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded bg-ceal-100 px-2 py-0.5 font-medium text-ceal-800">{req.ref}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">{req.category}</span>
                      {req.isMandatory && (
                        <span className="rounded bg-red-100 px-2 py-0.5 font-medium text-red-800">Mandatory</span>
                      )}
                      <span className="text-ceal-600">confidence {(req.extractionConfidence * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-sm text-ceal-900">{req.text}</p>
                    {opp && (
                      <p className="text-xs text-ceal-700">
                        Opportunity:{' '}
                        <Link href={`/opportunities/${opp.id}`} className="underline">
                          {opp.title}
                        </Link>{' '}
                        · {opp.funder}
                      </p>
                    )}
                  </div>
                  <VerifyRequirementButton requirementId={req.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
