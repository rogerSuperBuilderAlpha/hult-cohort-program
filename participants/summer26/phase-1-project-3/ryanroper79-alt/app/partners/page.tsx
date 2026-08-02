import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { PartnerInquiryForm } from '@/components/PartnerInquiryForm';
import { positioning, proofInventory } from '@/data/cohort';

export const metadata: Metadata = {
  title: 'Partners',
  description:
    'Engage the Hult Climate Builder Network — cohort participants shipping climate software for Caribbean and SIDS communities.',
};

export default function PartnersPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Cohort partners</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">
          Partner with the Climate Builder Network
        </h1>
        <p className="mt-4 max-w-prose text-xl text-ceal-muted">
          Participants ship deployable software in public against island climate and resilience
          problems. Inspect evidence on{' '}
          <Link href="/work" className="text-ceal-leaf underline focus-ring rounded">
            /work
          </Link>{' '}
          before you reach out. This is a cohort introduction channel — not a marketplace.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/work"
            className="inline-block rounded-md bg-ceal-sun px-5 py-3 font-semibold text-ceal-ink focus-ring hover:bg-ceal-sunGlow"
          >
            Work ledger →
          </Link>
          <Link
            href="/rsvp"
            className="inline-block rounded-md border border-ceal-mangrove px-5 py-3 font-semibold text-ceal-mangrove focus-ring hover:bg-ceal-panel"
          >
            Showcase RSVP →
          </Link>
          <Link
            href="/partners/readme"
            className="self-center font-medium text-ceal-leaf underline focus-ring rounded"
          >
            Partner README →
          </Link>
        </div>

        <section className="mt-16 rounded-lg border border-ceal-line bg-ceal-white p-6 md:p-8">
          <h2 className="font-display text-2xl text-ceal-mangrove">Request introduction</h2>
          <p className="mt-2 text-sm text-ceal-muted">
            Name the participant handle you want to meet. Responses within two business days when
            notification services are configured.
          </p>
          <PartnerInquiryForm />
        </section>

        <section className="mt-12 rounded-lg border border-ceal-line bg-ceal-panel p-6">
          <h2 className="font-display text-2xl text-ceal-mangrove">Evidence first</h2>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link href="/work" className="text-ceal-leaf underline focus-ring rounded">
              /work — artifact ledger →
            </Link>
            <Link href="/status" className="text-ceal-leaf underline focus-ring rounded">
              /status — CI & verify →
            </Link>
            <a
              href={proofInventory.productionUrl}
              className="text-ceal-leaf underline focus-ring rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              Production deploy →
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
