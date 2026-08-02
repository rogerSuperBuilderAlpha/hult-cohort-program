import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { RsvpForm } from '@/components/RsvpForm';
import { showcaseEvent } from '@/data/cohort';

export const metadata: Metadata = {
  title: 'Showcase RSVP',
  description: `RSVP for the ${showcaseEvent.title} — ${showcaseEvent.when}.`,
};

export default function RsvpPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Hiring partners</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">{showcaseEvent.title}</h1>
        <p className="mt-4 text-lg text-ceal-muted">{showcaseEvent.when}</p>
        <p className="mt-4 text-ceal-muted">{showcaseEvent.description}</p>

        <section className="mt-10 rounded-lg border border-ceal-line bg-ceal-panel p-6 md:p-8">
          <h2 className="font-display text-xl text-ceal-mangrove">Register your interest</h2>
          <p className="mt-2 text-sm text-ceal-muted">
            Partners and hiring managers: RSVP to receive logistics and a builder roster preview before the
            event.
          </p>
          <RsvpForm />
        </section>

        <p className="mt-8 text-sm text-ceal-muted">
          Prefer to engage now?{' '}
          <Link href="/partners" className="text-ceal-leaf underline focus-ring rounded">
            Partner enquiry →
          </Link>{' '}
          ·{' '}
          <Link href="/builders" className="text-ceal-leaf underline focus-ring rounded">
            Meet builders →
          </Link>
        </p>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
