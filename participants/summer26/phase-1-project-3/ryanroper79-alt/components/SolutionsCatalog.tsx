import Link from 'next/link';
import { partnerSolutions } from '@/data/solutions';

type Props = {
  limit?: number;
  showViewAll?: boolean;
};

export function SolutionsCatalog({ limit, showViewAll = false }: Props) {
  const items = limit ? partnerSolutions.slice(0, limit) : partnerSolutions;

  return (
    <section aria-labelledby="solutions-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ceal-leaf">Digital & AI solutions</p>
          <h2 id="solutions-heading" className="mt-2 font-display text-3xl text-ceal-mangrove">
            Work worth partnering on
          </h2>
          <p className="mt-2 max-w-prose text-ceal-muted">
            Caribbean and SIDS infrastructure problems where Ryan R. Roper and the cohort ship software —
            evidence on-site, commercial project depth at{' '}
            <a
              href="https://www.cealgreen.com"
              className="text-ceal-leaf underline focus-ring rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              cealgreen.com
            </a>
            .
          </p>
        </div>
        {showViewAll ? (
          <Link href="/partners/solutions" className="text-sm font-medium text-ceal-leaf underline focus-ring rounded">
            View all solutions →
          </Link>
        ) : null}
      </div>

      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((solution) => (
          <li
            key={solution.slug}
            className="flex h-full flex-col rounded-lg border border-ceal-line bg-ceal-panel p-6 transition hover:border-ceal-leaf"
          >
            <p className="font-mono text-xs uppercase tracking-wider text-ceal-leaf">{solution.domain.replace('-', ' · ')}</p>
            <h3 className="mt-2 font-display text-xl text-ceal-mangrove">{solution.title}</h3>
            <p className="mt-3 flex-1 text-sm text-ceal-muted">{solution.summary}</p>
            <p className="mt-4 font-mono text-xs text-ceal-muted">
              Needs: {solution.needs.join(' · ')}
            </p>
            <Link
              href={`/partners#inquiry?solution=${solution.slug}`}
              className="mt-4 inline-block text-sm font-semibold text-ceal-leaf underline focus-ring rounded"
            >
              Request briefing →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
