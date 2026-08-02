import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { WorkLedger } from '@/components/WorkLedger';

export const metadata: Metadata = {
  title: 'Shipped work',
  description: 'Cross-cohort climate software index — weeks 1–3, artifact scorecards, honest evidence links.',
};

export default function WorkPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Build ledger</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">Shipped work</h1>
        <p className="mt-4 max-w-prose text-lg text-ceal-muted">
          Three-week cross-cohort index: participant, week, project, deploy link. Missing evidence
          renders as an honest{' '}
          <span className="font-mono text-xs">not yet indexed</span> chip — never a fabricated URL.
        </p>

        <div className="mt-10">
          <WorkLedger />
        </div>

        <div className="mt-12">
          <Link
            href="/join"
            className="inline-block rounded-md bg-ceal-sun px-5 py-3 font-semibold text-ceal-ink focus-ring hover:bg-ceal-sunGlow"
          >
            Add your work to the showcase →
          </Link>
        </div>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
