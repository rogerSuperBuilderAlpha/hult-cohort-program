import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { BuildersDirectory } from '@/components/BuildersDirectory';

export const metadata: Metadata = {
  title: 'Builders',
  description:
    'Meet the Hult Summer Pilot 2026 cohort — skills, profiles, and shipped work. Featured: Ryan R. Roper.',
};

export default function BuildersPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Directory</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">Builders</h1>
        <p className="mt-4 max-w-prose text-lg text-ceal-muted">
          The people behind the projects — skills, stories, and evidence-linked work. Partners can
          name a builder when submitting an enquiry on{' '}
          <Link href="/partners#inquiry" className="text-ceal-leaf underline focus-ring rounded">
            /partners
          </Link>
          .
        </p>

        <div className="mt-10">
          <BuildersDirectory />
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/partners"
            className="inline-block rounded-md bg-ceal-sun px-5 py-3 font-semibold text-ceal-ink focus-ring hover:bg-ceal-sunGlow"
          >
            Partner with the cohort →
          </Link>
          <Link href="/work" className="self-center font-medium text-ceal-leaf underline focus-ring rounded">
            Work index →
          </Link>
        </div>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
