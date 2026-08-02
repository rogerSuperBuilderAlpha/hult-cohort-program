import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { MarkdownDocument, readPartnersMarkdown } from '@/lib/markdown';

export const metadata: Metadata = {
  title: 'Partner README',
  description: 'Partner-facing README for the Hult Summer Pilot 2026 cohort showcase.',
};

export default function PartnersReadmePage() {
  const md = readPartnersMarkdown();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Partner README</p>
        <div className="mt-6">
          <MarkdownDocument md={md} />
        </div>
        <p className="mt-12 text-sm text-ceal-muted">
          Source:{' '}
          <code className="rounded bg-ceal-panel px-1 py-0.5 font-mono text-xs">PARTNERS.md</code>{' '}
          at repo root ·{' '}
          <Link href="/partners" className="text-ceal-leaf underline focus-ring rounded">
            Back to partners
          </Link>
        </p>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
