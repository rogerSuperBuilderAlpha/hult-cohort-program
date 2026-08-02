import Link from 'next/link';
import { proofInventory } from '@/data/cohort';

const proofLinks = [
  {
    label: 'Production deploy',
    href: proofInventory.productionUrl,
    meta: 'This showcase · HTTPS',
  },
  {
    label: 'Submission PR #186',
    href: proofInventory.submissionPrUrl,
    meta: 'Week 3 · merged',
  },
  {
    label: 'Full work index',
    href: '/work',
    meta: 'Weeks 1–3 · all participants',
  },
  {
    label: 'Sync PR #201',
    href: proofInventory.syncPrUrl,
    meta: 'Scope freeze · ready for admin merge',
  },
  {
    label: 'Vote for this showcase',
    href: '/vote',
    meta: 'Peer review · Vote: up',
  },
] as const;

export function ProofStrip() {
  return (
    <section aria-labelledby="proof-heading">
      <h2 id="proof-heading" className="font-display text-3xl text-ceal-mangrove">
        The proof
      </h2>
      <p className="mt-3 max-w-prose text-ceal-muted">
        Clickable evidence within one screen — deploys, pull requests, and the cross-cohort ledger.
        No slide deck required.
      </p>
      <ul className="mt-8 divide-y divide-ceal-line rounded-lg border border-ceal-line bg-ceal-white">
        {proofLinks.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-ceal-panel focus-ring"
              {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className="font-medium text-ceal-mangrove">{item.label}</span>
              <span className="font-mono text-xs text-ceal-muted">{item.meta}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-mono text-xs text-ceal-muted">
        {proofInventory.cohortTerm} · program week {proofInventory.programWeek}
      </p>
    </section>
  );
}
