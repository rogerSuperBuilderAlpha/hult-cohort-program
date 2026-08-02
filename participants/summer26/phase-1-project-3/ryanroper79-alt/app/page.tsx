import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { ExpertsStrip } from '@/components/ExpertsStrip';
import { PeopleStrip } from '@/components/PeopleStrip';
import { ProofStrip } from '@/components/ProofStrip';
import { ScrollReveal } from '@/components/ScrollReveal';
import { ShipTicker } from '@/components/ShipTicker';
import { positioning } from '@/data/cohort';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <section className="max-w-prose">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">
            {positioning.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-ceal-mangrove md:text-5xl lg:text-6xl">
            {positioning.headline}
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-ceal-muted">{positioning.subhead}</p>
          <p className="mt-4 text-sm text-ceal-muted">{positioning.sourceNote}</p>
        </section>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/work"
            className="inline-block rounded-md bg-ceal-sun px-5 py-3 font-semibold text-ceal-ink focus-ring hover:bg-ceal-sunGlow"
          >
            Inspect shipped work →
          </Link>
          <Link
            href="/partners"
            className="inline-block rounded-md border border-ceal-mangrove px-5 py-3 font-semibold text-ceal-mangrove focus-ring hover:bg-ceal-panel"
          >
            Partner with the cohort →
          </Link>
        </div>

        <aside className="mt-10 rounded-lg border border-ceal-sun bg-gradient-to-br from-ceal-panel to-ceal-sunGlow/30 p-6 md:p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-ceal-leaf">Review week</p>
          <h2 className="mt-2 font-display text-2xl text-ceal-mangrove">
            Cohort peers — vote for the showcase you want operated
          </h2>
          <p className="mt-3 max-w-prose text-ceal-muted">
            File a written technical review with{' '}
            <code className="rounded bg-ceal-white px-1 py-0.5 font-mono text-xs">Vote: up</code> on
            this submission. The site with the most votes becomes the cohort&apos;s public marketing
            surface for the rest of the pilot.
          </p>
          <Link
            href={positioning.votePath}
            className="mt-6 inline-block rounded-md bg-ceal-mangrove px-5 py-3 font-semibold text-ceal-white focus-ring hover:opacity-90"
          >
            Open one-click vote link →
          </Link>
        </aside>

        <ScrollReveal>
          <div className="mt-20">
            <ProofStrip />
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mt-20">
            <PeopleStrip />
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mt-20">
            <ExpertsStrip />
          </div>
        </ScrollReveal>

        <ShipTicker />

        <section className="mt-20 rounded-lg border border-ceal-line bg-ceal-panel p-8 md:p-10">
          <h2 className="font-display text-3xl text-ceal-mangrove">Contribute to the showcase</h2>
          <p className="mt-4 max-w-prose text-lg text-ceal-muted">
            Every enrolled builder already has a profile. Send a pull request to update yours, or
            inspect the three-week ledger before you ship.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={positioning.joinPath}
              className="inline-block rounded-md bg-ceal-sun px-5 py-3 font-semibold text-ceal-ink focus-ring hover:bg-ceal-sunGlow"
            >
              Add your work to the showcase →
            </Link>
            <Link href="/work" className="self-center font-medium text-ceal-leaf underline focus-ring rounded">
              Work index →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
