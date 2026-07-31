import type { Metadata } from 'next';
import Link from 'next/link';
import { FeasibilityProjects } from '@/components/FeasibilityProjects';
import { SiteHeader } from '@/components/SiteHeader';
import { PartnerCta, SiteFooter } from '@/components/PartnerCta';
import { positioning, proofInventory } from '@/data/cohort';
import { thoughtLeader } from '@/data/thought-leader';

export const metadata: Metadata = {
  title: 'Partners',
  description:
    'Invest in Caribbean infrastructure — wave energy, solar farms, modular homes. Request feasibility reports with payback, returns, and investor cohort structure.',
};

export default function PartnersPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">For investors</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">
          Choose a project. Receive the report.
        </h1>
        <p className="mt-4 max-w-prose text-xl text-ceal-muted">
          {positioning.brand.sponsorLine} We do not publish payback or return figures on this
          site — you receive the full feasibility report when you name the project you want to
          invest in.
        </p>

        <FeasibilityProjects />

        <section className="mt-16 space-y-4">
          <h2 className="font-display text-2xl text-ceal-mangrove">How engagement works</h2>
          <ol className="list-decimal space-y-3 pl-5 text-ceal-muted">
            <li>Select wave energy, solar farms, or modular homes above</li>
            <li>Request the report — email {positioning.contact} or use the project card CTA</li>
            <li>Review payback, rates of return, scope, schedule, cost, and investor cohort structure</li>
            <li>CEAL Green names your investment required and delivery governance before you commit</li>
          </ol>
        </section>

        <section className="mt-12 rounded-lg border border-ceal-line bg-ceal-panel p-6">
          <h2 className="font-display text-2xl text-ceal-mangrove">Thought leader</h2>
          <p className="mt-2 font-medium text-ceal-ink">{thoughtLeader.name}</p>
          <p className="mt-2 text-ceal-muted">{thoughtLeader.bio}</p>
          <p className="mt-4">
            <a
              href={thoughtLeader.linkedin}
              className="text-ceal-leaf underline focus-ring rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn →
            </a>
          </p>
        </section>

        <section className="mt-12 space-y-3">
          <h2 className="font-display text-2xl text-ceal-mangrove">Software cohort evidence</h2>
          <p className="text-ceal-muted">
            The Summer Pilot 2026 cohort ships deployable software in public — inspect artifacts
            before you allocate capital to a physical project.
          </p>
          <ul className="space-y-2 text-ceal-muted">
            <li>
              Work index:{' '}
              <Link href="/work" className="text-ceal-leaf underline focus-ring rounded">
                /work
              </Link>
            </li>
            <li>
              Production:{' '}
              <a
                href={proofInventory.productionUrl}
                className="text-ceal-leaf underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {proofInventory.productionUrl}
              </a>
            </li>
            <li>
              Submission PR:{' '}
              <a
                href={proofInventory.submissionPrUrl}
                className="text-ceal-leaf underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                #{proofInventory.submissionPrUrl.split('/').pop()}
              </a>
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <p className="text-sm text-ceal-muted">
            Full partner README:{' '}
            <code className="rounded bg-ceal-panel px-1 py-0.5 text-ceal-ink">PARTNERS.md</code> in
            the cohort repo submission folder.
          </p>
          <p className="mt-2 text-sm">
            <a
              href={positioning.brand.guidelinesUrl}
              className="text-ceal-leaf underline focus-ring rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              CEAL Green brand guidelines →
            </a>
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <PartnerCta />
          <Link
            href="/work"
            className="self-center font-medium text-ceal-leaf underline focus-ring rounded"
          >
            Work index →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
