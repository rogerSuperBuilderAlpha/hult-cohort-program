import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { PartnerCta, SiteFooter } from '@/components/PartnerCta';
import { allWorkEntries } from '@/lib/work-index';

export const metadata: Metadata = {
  title: 'Shipped work',
  description: 'Cross-cohort index of deployed artifacts — week, project, live links.',
};

export default function WorkPage() {
  const entries = allWorkEntries();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Build ledger</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">Shipped work</h1>
        <p className="mt-4 max-w-prose text-lg text-ceal-muted">
          Every indexed artifact: participant, week, project, deploy link. An engineering record,
          not a brochure.
        </p>

        {entries.length === 0 ? (
          <p className="mt-12 rounded-lg border border-dashed border-ceal-leaf bg-ceal-panel p-8 text-ceal-muted">
            Artifacts publish as submissions merge. The roster fills during review week.
          </p>
        ) : (
          <div className="mt-10 overflow-x-auto rounded-lg border border-ceal-line">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ceal-line bg-ceal-panel font-mono text-xs uppercase tracking-wider text-ceal-muted">
                  <th className="px-4 py-3 font-medium">Week</th>
                  <th className="px-4 py-3 font-medium">Builder</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row) => (
                  <tr key={`${row.handle}-${row.week}-${row.title}`} className="border-b border-ceal-line last:border-0">
                    <td className="px-4 py-4 font-mono text-ceal-mangrove">W{row.week}</td>
                    <td className="px-4 py-4">
                      <Link href={`/p/${row.handle}`} className="font-medium text-ceal-leaf underline focus-ring rounded">
                        {row.status === 'active' ? row.name : `@${row.handle}`}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-ceal-ink">{row.title}</p>
                      <p className="mt-1 text-ceal-muted">{row.summary}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        {row.liveUrl ? (
                          <a href={row.liveUrl} className="text-ceal-leaf underline focus-ring rounded" target="_blank" rel="noopener noreferrer">
                            Live →
                          </a>
                        ) : null}
                        {row.prUrl ? (
                          <a href={row.prUrl} className="text-ceal-leaf underline focus-ring rounded" target="_blank" rel="noopener noreferrer">
                            PR →
                          </a>
                        ) : null}
                        {!row.liveUrl && !row.prUrl ? (
                          <span className="text-ceal-muted">Pending</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-12">
          <PartnerCta />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
