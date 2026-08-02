import Link from 'next/link';
import { experts } from '@/data/experts';

export function ExpertsStrip() {
  return (
    <section aria-labelledby="experts-heading">
      <h2 id="experts-heading" className="font-display text-3xl text-ceal-mangrove">
        Caribbean infrastructure experts
      </h2>
      <p className="mt-3 max-w-prose text-ceal-muted">
        Resilient infrastructure and energy sovereignty for the Caribbean requires practitioners who
        understand regional grid realities, policy, and delivery — not imported playbooks alone.
        CEAL Green connects cohort software to this advisor network; commercial project work lives at{' '}
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
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {experts.map((expert) => (
          <li
            key={expert.linkedin}
            className="rounded-lg border border-ceal-line bg-ceal-panel p-5"
          >
            <p className="font-display text-xl text-ceal-mangrove">{expert.name}</p>
            <p className="mt-1 text-sm font-medium text-ceal-leaf">{expert.role}</p>
            <p className="mt-3 text-sm text-ceal-muted">{expert.focus}</p>
            <a
              href={expert.linkedin}
              className="mt-4 inline-block text-sm font-medium text-ceal-leaf underline focus-ring rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn profile →
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-ceal-muted">
        Partner with the cohort on software pilots, or follow CEAL Green for Caribbean resilient
        infrastructure projects —{' '}
        <Link href="/partners" className="text-ceal-leaf underline focus-ring rounded">
          see engagement models →
        </Link>
      </p>
    </section>
  );
}
