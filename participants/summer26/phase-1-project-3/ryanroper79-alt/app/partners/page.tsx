import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { FeaturedBuilderSpotlight } from '@/components/FeaturedBuilderSpotlight';
import { ExpertsStrip } from '@/components/ExpertsStrip';
import { PartnerInquiryForm } from '@/components/PartnerInquiryForm';
import { CalendlyEmbed } from '@/components/CalendlyEmbed';
import { SolutionsCatalog } from '@/components/SolutionsCatalog';
import { positioning, proofInventory } from '@/data/cohort';

export const metadata: Metadata = {
  title: 'Partners',
  description:
    'Partner with Ryan R. Roper and the Hult Summer Pilot 2026 cohort — digital/AI solutions for Caribbean resilient infrastructure and renewable energy.',
};

export default function PartnersPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">For partners & investors</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">
          Partner with the Hult Summer Cohort
        </h1>
        <p className="mt-4 max-w-prose text-xl text-ceal-muted">
          Builders here ship in public — with deploy evidence, live verification, and peer-reviewed
          software. Partners plug into pilots, sponsorship, and digital/AI delivery for Caribbean
          resilient infrastructure and energy transition, led by{' '}
          <Link href="/p/ryanroper79-alt" className="text-ceal-leaf underline focus-ring rounded">
            Ryan R. Roper
          </Link>
          .
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/partners/solutions"
            className="inline-block rounded-md bg-ceal-sun px-5 py-3 font-semibold text-ceal-ink focus-ring hover:bg-ceal-sunGlow"
          >
            Browse solutions →
          </Link>
          <Link
            href="/builders"
            className="inline-block rounded-md border border-ceal-mangrove px-5 py-3 font-semibold text-ceal-mangrove focus-ring hover:bg-ceal-panel"
          >
            Meet the builders →
          </Link>
          <Link
            href="/work"
            className="self-center font-medium text-ceal-leaf underline focus-ring rounded"
          >
            Inspect shipped work →
          </Link>
        </div>

        <div className="mt-16">
          <FeaturedBuilderSpotlight />
        </div>

        <div className="mt-16">
          <SolutionsCatalog limit={4} showViewAll />
        </div>

        <section className="mt-16">
          <ExpertsStrip />
        </section>

        <section className="mt-16 rounded-lg border border-ceal-line bg-ceal-white p-6 md:p-8">
          <h2 className="font-display text-2xl text-ceal-mangrove">Express interest</h2>
          <PartnerInquiryForm />
        </section>

        <section className="mt-12 rounded-lg border border-ceal-line bg-ceal-panel p-6">
          <h2 className="font-display text-2xl text-ceal-mangrove">20-minute briefing</h2>
          <p className="mt-2 text-sm text-ceal-muted">
            Book a briefing with Ryan and the cohort maintainer team.
          </p>
          <CalendlyEmbed />
          <p className="mt-4 text-sm">
            <Link href="/partners/readme" className="text-ceal-leaf underline focus-ring rounded">
              Capability statement (printable README) →
            </Link>
          </p>
        </section>

        <section className="mt-12 rounded-lg border border-ceal-line bg-ceal-panel p-6">
          <h2 className="font-display text-2xl text-ceal-mangrove">Evidence & response</h2>
          <p className="mt-3 text-ceal-muted">
            We reply within <strong>2 business days</strong>. Inspect the three-week ledger and live
            verification before you engage.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link href="/work" className="text-ceal-leaf underline focus-ring rounded">
              /work — cross-cohort ledger →
            </Link>
            <Link href="/status" className="text-ceal-leaf underline focus-ring rounded">
              /status — CI & verify →
            </Link>
            <Link href="/partners/readme" className="text-ceal-leaf underline focus-ring rounded">
              Partner README →
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

        <p className="mt-12 text-sm text-ceal-muted">
          CEAL Green Energy Limited maintains this platform. Commercial resilient infrastructure
          project work is at{' '}
          <a
            href={positioning.cealGreenUrl}
            className="text-ceal-leaf underline focus-ring rounded"
            target="_blank"
            rel="noopener noreferrer"
          >
            cealgreen.com
          </a>
          .
        </p>

        <p className="mt-6 text-xs text-ceal-muted">
          Nothing on this site constitutes an offer of securities or investment advice. Partner
          enquiries concern digital/AI capability and cohort engagement — not capital solicitation.
        </p>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
