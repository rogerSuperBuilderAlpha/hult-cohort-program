import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { ExpertsStrip } from '@/components/ExpertsStrip';
import { participants } from '@/data/participants';
import { positioning, proofInventory } from '@/data/cohort';

export const metadata: Metadata = {
  title: 'Partners',
  description:
    'Engage the Hult Summer Pilot 2026 cohort — hire builders, sponsor sprints, or co-develop Caribbean infrastructure pilots.',
};

const engagementModels = [
  {
    title: 'Hire a builder',
    body: 'Participants are available for contract or full-time work. Browse profiles and name the builder you want to speak with.',
    href: '/work',
    cta: 'Browse profiles via work index',
  },
  {
    title: 'Sponsor a build',
    body: 'Fund a one-week sprint against a named Caribbean or SIDS infrastructure problem. Output is an MIT-licensed deploy with public PR evidence.',
    href: '/join',
    cta: 'Start a sponsor conversation',
  },
  {
    title: 'Co-develop a pilot',
    body: 'Bring a live infrastructure problem — grid integration, field comms, public evidence surfaces. The cohort ships a working prototype in one cycle.',
    href: '/join',
    cta: 'Propose a pilot',
  },
] as const;

export default function PartnersPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">For partners</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">
          Partner with the cohort
        </h1>
        <p className="mt-4 max-w-prose text-xl text-ceal-muted">
          The Hult Summer Pilot 2026 ships deployable software against real Caribbean and Small Island
          Developing State infrastructure problems — in one-week cycles, in public. This page describes
          how to engage the cohort, not how to allocate capital.
        </p>

        <section className="mt-12 space-y-6">
          <h2 className="font-display text-2xl text-ceal-mangrove">Engagement models</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {engagementModels.map((model) => (
              <li key={model.title} className="rounded-lg border border-ceal-line bg-ceal-panel p-6">
                <h3 className="font-display text-xl text-ceal-mangrove">{model.title}</h3>
                <p className="mt-3 text-sm text-ceal-muted">{model.body}</p>
                <Link
                  href={model.href}
                  className="mt-4 inline-block text-sm font-medium text-ceal-leaf underline focus-ring rounded"
                >
                  {model.cta} →
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 space-y-4">
          <h2 className="font-display text-2xl text-ceal-mangrove">What the cohort has shipped</h2>
          <p className="text-ceal-muted">
            Inspect the three-week ledger — PM platform, comms workspace, and vibe marketing
            showcases from every enrolled builder.
          </p>
          <Link href="/work" className="font-medium text-ceal-leaf underline focus-ring rounded">
            /work — full cross-cohort index →
          </Link>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-display text-2xl text-ceal-mangrove">Sample builder profiles</h2>
          <ul className="flex flex-wrap gap-3 text-sm">
            {participants.slice(0, 6).map((p) => (
              <li key={p.handle}>
                <Link href={`/p/${p.handle}`} className="text-ceal-leaf underline focus-ring rounded">
                  {p.displayName}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <ExpertsStrip />
        </section>

        <section className="mt-16 rounded-lg border border-ceal-line bg-ceal-panel p-6">
          <h2 className="font-display text-2xl text-ceal-mangrove">Response commitment</h2>
          <p className="mt-3 text-ceal-muted">
            We reply to partner inquiries within <strong>2 business days</strong>. Use{' '}
            <Link href="/join" className="text-ceal-leaf underline focus-ring rounded">
              /join
            </Link>{' '}
            to start a conversation or inspect the full partner README.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link href="/partners/readme" className="text-ceal-leaf underline focus-ring rounded">
              Partner-facing README →
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
          CEAL Green Energy Limited maintains this platform. Commercial project work, including
          Commercial project work for Caribbean resilient infrastructure is at{' '}
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
          Nothing on this site constitutes an offer of securities or investment advice.
        </p>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
