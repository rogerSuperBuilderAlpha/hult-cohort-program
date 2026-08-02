import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { VerifySummaryPanel } from '@/components/VerifySummaryPanel';
import { allHandles } from '@/data/participants';
import { ledgerEntries } from '@/data/ledger';
import { proofInventory, positioning } from '@/data/cohort';

export const metadata: Metadata = {
  title: 'Platform status',
  description: 'CI, live verification, and quality gates for the cohort showcase.',
};

const CI_BADGE =
  'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/actions/workflows/showcase-cealgreen-projects.yml/badge.svg';

export default function StatusPage() {
  const profileCount = allHandles().length;
  const ledgerCount = ledgerEntries.length;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Quality surface</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">Platform status</h1>
        <p className="mt-4 text-lg text-ceal-muted">
          Evidence over assertion — CI gates, live deploy checks, and accessibility targets published
          for peer technical review.
        </p>

        <section className="mt-12 rounded-lg border border-ceal-line bg-ceal-panel p-6">
          <h2 className="font-display text-2xl text-ceal-mangrove">Continuous integration</h2>
          <p className="mt-2 text-sm text-ceal-muted">
            Every PR touching this app runs build, lint, and typecheck.
          </p>
          <a
            href="https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/actions/workflows/showcase-cealgreen-projects.yml"
            className="mt-4 inline-block focus-ring rounded"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CI_BADGE} alt="CI status" width={120} height={20} />
          </a>
        </section>

        <section className="mt-10 rounded-lg border border-ceal-line bg-ceal-panel p-6">
          <h2 className="font-display text-2xl text-ceal-mangrove">Live verification</h2>
          <p className="mt-2 text-sm text-ceal-muted">
            <Link href="/api/verify" className="text-ceal-leaf underline focus-ring rounded">
              /api/verify
            </Link>{' '}
            — GitHub PR state + deploy HEAD checks, 10-minute cache.
          </p>
          <VerifySummaryPanel />
        </section>

        <section className="mt-10 rounded-lg border border-ceal-line bg-ceal-panel p-6">
          <h2 className="font-display text-2xl text-ceal-mangrove">Coverage</h2>
          <ul className="mt-4 space-y-2 text-sm text-ceal-muted">
            <li>
              <strong>{profileCount}</strong> published profiles at{' '}
              <code className="font-mono text-xs">/p/&#123;handle&#125;</code>
            </li>
            <li>
              <strong>{ledgerCount}</strong> ledger entries on{' '}
              <Link href="/work" className="text-ceal-leaf underline focus-ring rounded">
                /work
              </Link>
            </li>
            <li>
              Production:{' '}
              <a
                href={proofInventory.productionUrl}
                className="text-ceal-leaf underline focus-ring rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                {proofInventory.productionUrl}
              </a>
            </li>
          </ul>
        </section>

        <section className="mt-10 rounded-lg border border-ceal-line bg-ceal-panel p-6">
          <h2 className="font-display text-2xl text-ceal-mangrove">Quality targets</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ceal-muted">
            <li>Lighthouse ≥ 90 — performance, accessibility, best practices, SEO on `/`, `/work`, `/p/&#123;handle&#125;`</li>
            <li>Zero critical axe violations on the same routes</li>
            <li>
              Run locally:{' '}
              <code className="font-mono text-xs">npm run typecheck && npm run build</code>
            </li>
          </ul>
        </section>

        <p className="mt-10 text-sm text-ceal-muted">
          Maintainer:{' '}
          <a
            href={positioning.maintainer.githubUrl}
            className="text-ceal-leaf underline focus-ring rounded"
            target="_blank"
            rel="noopener noreferrer"
          >
            @{positioning.maintainer.githubHandle}
          </a>
        </p>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
