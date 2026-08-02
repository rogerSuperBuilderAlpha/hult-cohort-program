import Link from 'next/link';
import { positioning } from '@/data/cohort';
import { ThemeToggle } from '@/components/ThemeProvider';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/join', label: 'Join' },
  { href: '/partners', label: 'Partners' },
  { href: '/contribute', label: 'Contribute' },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-ceal-line bg-ceal-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="focus-ring rounded-md">
          <span className="font-display text-lg text-ceal-mangrove">{positioning.cohortMark}</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-ceal-mangrove">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ceal-leaf focus-ring rounded">
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function StickyJoinBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-ceal-line bg-ceal-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href={positioning.joinPath}
          className="text-sm font-semibold text-ceal-mangrove hover:text-ceal-leaf focus-ring rounded"
        >
          Add your work to the showcase →
        </Link>
        <Link
          href={positioning.votePath}
          className="hidden rounded-md bg-ceal-sun px-4 py-2 text-sm font-semibold text-ceal-ink hover:bg-ceal-sunGlow focus-ring sm:inline-block"
        >
          Vote for this site →
        </Link>
      </div>
    </div>
  );
}

export function SiteFooter() {
  const { maintainer, cealGreenUrl } = positioning;

  return (
    <footer className="mt-20 border-t border-ceal-line bg-ceal-panel pb-24">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm text-ceal-muted">
          Built and maintained by{' '}
          <a
            href={cealGreenUrl}
            className="font-medium text-ceal-leaf underline focus-ring rounded"
            target="_blank"
            rel="noopener noreferrer"
          >
            CEAL Green Energy Limited · cealgreen.com
          </a>
        </p>
        <p className="mt-2 text-sm text-ceal-muted">
          Maintainer: {maintainer.name} ·{' '}
          <a
            href={maintainer.githubUrl}
            className="text-ceal-leaf underline focus-ring rounded"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub @{maintainer.githubHandle}
          </a>
        </p>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <li>
            <Link href="/contribute" className="text-ceal-leaf underline focus-ring rounded">
              Contribute
            </Link>
          </li>
          <li>
            <Link href="/status" className="text-ceal-leaf underline focus-ring rounded">
              Platform status
            </Link>
          </li>
          <li>
            <Link href="/changelog" className="text-ceal-leaf underline focus-ring rounded">
              Changelog
            </Link>
          </li>
          <li>
            <Link href="/partners/readme" className="text-ceal-leaf underline focus-ring rounded">
              Partner README
            </Link>
          </li>
          <li>
            <Link href={positioning.votePath} className="text-ceal-leaf underline focus-ring rounded">
              Vote for this showcase
            </Link>
          </li>
          <li>
            <Link href={positioning.joinPath} className="text-ceal-leaf underline focus-ring rounded">
              Join the roster
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
