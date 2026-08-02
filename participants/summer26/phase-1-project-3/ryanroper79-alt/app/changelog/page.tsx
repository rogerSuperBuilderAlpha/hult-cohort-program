import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { changelog } from '@/data/changelog';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Ship log during review week — improvements while peers inspect the showcase.',
};

export default function ChangelogPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Ship log</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">Changelog</h1>
        <p className="mt-4 text-ceal-muted">
          Shipping during review week is itself the signal — this platform is operated, not abandoned.
        </p>

        <ol className="mt-10 space-y-8">
          {changelog.map((entry) => (
            <li key={entry.date + entry.title} className="border-l-2 border-ceal-leaf pl-6">
              <p className="font-mono text-xs uppercase text-ceal-muted">{entry.date}</p>
              <h2 className="mt-1 font-display text-2xl text-ceal-mangrove">{entry.title}</h2>
              <p className="mt-2 text-ceal-muted">{entry.summary}</p>
              {entry.href ? (
                <Link href={entry.href} className="mt-3 inline-block text-sm text-ceal-leaf underline focus-ring rounded">
                  Inspect →
                </Link>
              ) : null}
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
