import Link from 'next/link';
import { readSession } from '@/lib/ludwitt/session';
import { listOpportunities, listSources } from '@/lib/db/store';
import { FinderPollButton } from '@/components/FinderPollButton';
import { loadQualConfig } from '@/lib/bidmanager/config';

export default async function FinderPage() {
  const session = await readSession();
  const config = loadQualConfig();
  const opportunities = listOpportunities().filter((o) => o.stage !== 'plan');
  const sources = listSources();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Finder</h2>
          <p className="text-sm text-ceal-800/80">
            Relevance ≥ {config.relevanceThreshold}% → screening. Never auto-bid on relevance alone.
          </p>
        </div>
        {session && <FinderPollButton />}
      </div>

      <section className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-ceal-50/80">
            <tr>
              <th className="p-3">Source</th>
              <th className="p-3">Tier</th>
              <th className="p-3">Last polled</th>
              <th className="p-3">Last success</th>
            </tr>
          </thead>
          <tbody>
            {sources.filter((s) => s.kind !== 'manual').map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.tier}</td>
                <td className="p-3">{s.lastPolledAt ?? '—'}</td>
                <td className="p-3">{s.lastSuccessAt ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Opportunities</h3>
        {opportunities.map((o) => (
          <article key={o.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <h4 className="font-medium">{o.title}</h4>
              <span className="text-sm text-ceal-700">{o.relevanceScore}% · {o.funder}</span>
            </div>
            <p className="mt-1 text-sm text-ceal-800/75">{o.relevanceRationale}</p>
            {session && (
              <Link href={`/opportunities/${o.id}`} className="mt-2 inline-block text-sm font-medium text-ceal-700 underline">
                Qualify →
              </Link>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
