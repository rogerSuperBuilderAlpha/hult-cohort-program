import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { JoinForm } from '@/components/JoinForm';

export const metadata: Metadata = {
  title: 'Join the roster',
  description:
    'Peers join the Summer Pilot 2026 showcase during review week — submit handle, headline, and links.',
};

export default function JoinPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Review week</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">
          Join the showcase roster
        </h1>
        <p className="mt-4 text-lg text-ceal-muted">
          Submit your GitHub handle and one human-written headline. Approved entries publish on
          redeploy — no database, no auth gate. Inspect shipped work on{' '}
          <Link href="/work" className="text-ceal-leaf underline focus-ring rounded">
            /work
          </Link>{' '}
          first if you want to see the bar.
        </p>

        <div className="mt-10">
          <JoinForm />
        </div>

        <p className="mt-10 text-sm text-ceal-muted">
          Profiles are hand-edited in{' '}
          <code className="rounded bg-ceal-panel px-1.5 py-0.5 font-mono text-xs">participants.ts</code>{' '}
          and statically generated at build.
        </p>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
