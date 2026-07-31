import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { PartnerCta, SiteFooter } from '@/components/PartnerCta';
import { buildThemes } from '@/data/brand-guidelines';
import { positioning, proofInventory } from '@/data/cohort';
import { thoughtLeader } from '@/data/thought-leader';

export const metadata: Metadata = {
  title: 'Partners',
  description: 'Sponsor the Hult Cohort Summer Pilot 2026 — fund seats, inspect evidence, engage CEAL Green.',
};

export default function PartnersPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">For partners</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">
          Sponsor capability, not slides
        </h1>
        <p className="mt-4 max-w-prose text-xl text-ceal-muted">{positioning.brand.sponsorLine}</p>

        <section className="mt-12 space-y-6">
          <h2 className="font-display text-2xl text-ceal-mangrove">What you fund</h2>
          <ul className="list-disc space-y-2 pl-5 text-ceal-muted">
            <li>A cohort seat for a Caribbean builder shipping production software in public</li>
            <li>Or a named project sprint aligned to energy and digital transformation outcomes</li>
            <li>Evidence you can inspect before you commit — deploys, PRs, peer review on GitHub</li>
          </ul>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-display text-2xl text-ceal-mangrove">How engagement works</h2>
          <ol className="list-decimal space-y-3 pl-5 text-ceal-muted">
            <li>Review the work index and sample profiles on this site</li>
            <li>Email {positioning.contact} with scope and timeline</li>
            <li>CEAL Green names deliverables, entry cost, and sponsorship structure</li>
            <li>Builders ship; you inspect GitHub and live deploys throughout the pilot</li>
          </ol>
        </section>

        <section className="mt-12 rounded-lg border border-ceal-line bg-ceal-panel p-6">
          <h2 className="font-display text-2xl text-ceal-mangrove">Thought leader</h2>
          <p className="mt-2 font-medium text-ceal-ink">{thoughtLeader.name}</p>
          <p className="mt-2 text-ceal-muted">{thoughtLeader.bio}</p>
          <p className="mt-4">
            <a href={thoughtLeader.linkedin} className="text-ceal-leaf underline focus-ring rounded" target="_blank" rel="noopener noreferrer">
              LinkedIn →
            </a>
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-ceal-mangrove">Build themes we operate on</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {buildThemes.map((t) => (
              <li key={t.key} className="rounded-md border border-ceal-line px-4 py-3">
                <p className="font-medium text-ceal-mangrove">{t.key}</p>
                <p className="text-sm text-ceal-muted">{t.pillar}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 space-y-3">
          <h2 className="font-display text-2xl text-ceal-mangrove">Evidence on this deploy</h2>
          <ul className="space-y-2 text-ceal-muted">
            <li>
              Production:{' '}
              <a href={proofInventory.productionUrl} className="text-ceal-leaf underline" target="_blank" rel="noopener noreferrer">
                {proofInventory.productionUrl}
              </a>
            </li>
            <li>
              Submission PR:{' '}
              <a href={proofInventory.submissionPrUrl} className="text-ceal-leaf underline" target="_blank" rel="noopener noreferrer">
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
            <a href={positioning.brand.guidelinesUrl} className="text-ceal-leaf underline focus-ring rounded" target="_blank" rel="noopener noreferrer">
              CEAL Green brand guidelines →
            </a>
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <PartnerCta />
          <Link href="/work" className="font-medium text-ceal-leaf underline focus-ring rounded self-center">
            Work index →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
