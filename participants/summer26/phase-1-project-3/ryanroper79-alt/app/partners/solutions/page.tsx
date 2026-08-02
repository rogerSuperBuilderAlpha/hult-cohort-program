import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { SolutionsCatalog } from '@/components/SolutionsCatalog';
import { FeaturedBuilderSpotlight } from '@/components/FeaturedBuilderSpotlight';

export const metadata: Metadata = {
  title: 'Partner solutions',
  description:
    'Digital and AI solution catalog for Caribbean infrastructure — energy transition, resilient delivery, and evidence platforms.',
};

export default function PartnerSolutionsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Solution catalog</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">
          Digital & AI solutions for Caribbean infrastructure
        </h1>
        <p className="mt-4 max-w-prose text-lg text-ceal-muted">
          Problem-led offerings where Ryan R. Roper and the cohort ship software — not slide decks.
          Each card links to a partner enquiry with the solution pre-selected.
        </p>

        <div className="mt-10">
          <SolutionsCatalog />
        </div>

        <div className="mt-16">
          <FeaturedBuilderSpotlight variant="compact" />
        </div>

        <p className="mt-12">
          <Link href="/partners#inquiry" className="inline-block rounded-md bg-ceal-mangrove px-5 py-3 font-semibold text-ceal-white focus-ring hover:opacity-90">
            Submit partner enquiry →
          </Link>
        </p>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
