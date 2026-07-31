import Link from 'next/link';
import { participants } from '@/data/participants';

export function PeopleStrip() {
  return (
    <section aria-labelledby="people-heading">
      <h2 id="people-heading" className="font-display text-3xl text-ceal-mangrove">
        The people
      </h2>
      <p className="mt-3 max-w-prose text-ceal-muted">
        A cohort holding twenty-year infrastructure practitioners and first-time builders is
        more credible than either alone. Profiles publish as review week fills the roster.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {participants.map((p) => (
          <li key={p.handle}>
            <Link
              href={`/p/${p.handle}`}
              className={`block h-full rounded-lg border p-5 transition hover:border-ceal-leaf focus-ring ${
                p.status === 'pending'
                  ? 'border-dashed border-ceal-leaf bg-ceal-white'
                  : 'border-ceal-line bg-ceal-panel'
              }`}
            >
              <p className="font-mono text-xs uppercase tracking-wider text-ceal-leaf">
                {p.status === 'pending' ? 'Pending' : 'Active'}
              </p>
              <p className="mt-2 font-display text-xl text-ceal-mangrove">
                {p.status === 'active' ? p.name : `@${p.handle}`}
              </p>
              <p className="mt-2 text-sm text-ceal-muted line-clamp-3">{p.headline}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
