import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { BuildCurve } from '@/components/BuildCurve';
import { PartnerCta, SiteFooter } from '@/components/PartnerCta';
import { PeopleStrip } from '@/components/PeopleStrip';
import { ProofStrip } from '@/components/ProofStrip';
import { positioning } from '@/data/cohort';
import { thoughtLeader } from '@/data/thought-leader';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* 1 · Thesis */}
        <section className="max-w-prose">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">
            {positioning.brand.name} · Summer Pilot 2026
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-ceal-mangrove md:text-5xl lg:text-6xl">
            {positioning.thesis}
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-ceal-muted">{positioning.belief}</p>
        </section>

        <div className="mt-10">
          <BuildCurve />
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <PartnerCta />
          <Link
            href="/work"
            className="inline-block rounded-md border border-ceal-mangrove px-5 py-3 font-semibold text-ceal-mangrove focus-ring hover:bg-ceal-panel"
          >
            Inspect shipped work
          </Link>
        </div>

        {/* 2 · Proof */}
        <div className="mt-20">
          <ProofStrip />
        </div>

        {/* 3 · People */}
        <div className="mt-20">
          <PeopleStrip />
        </div>

        {/* 4 · Ask */}
        <section className="mt-20 rounded-lg border border-ceal-sun bg-gradient-to-br from-ceal-panel to-ceal-sunGlow/30 p-8 md:p-10">
          <h2 className="font-display text-3xl text-ceal-mangrove">The ask</h2>
          <p className="mt-4 max-w-prose text-lg text-ceal-ink">{positioning.partnerAsk}.</p>
          <p className="mt-3 max-w-prose text-ceal-muted">
            Wave energy, solar farms, or modular homes — we send the full feasibility report
            (payback, returns, scope, schedule, cost, investment required, and investor cohort
            structure) when you name the project. Start with {thoughtLeader.name} at{' '}
            {positioning.contact}.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <PartnerCta />
            <Link href="/partners" className="text-ceal-leaf underline focus-ring rounded font-medium">
              View feasibility studies →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
