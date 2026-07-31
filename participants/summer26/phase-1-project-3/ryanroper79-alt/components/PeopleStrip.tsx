import Link from 'next/link';
import type { Participant } from '@/data/participants';
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

      {participants.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-ceal-leaf bg-ceal-panel p-8 text-center">
          <p className="font-display text-xl text-ceal-mangrove">Roster opens during review week</p>
          <p className="mt-3 text-ceal-muted">
            Be the first profile on the showcase — submit handle and headline on the live deploy.
          </p>
          <Link
            href="/join"
            className="mt-6 inline-block rounded-md bg-ceal-sun px-5 py-3 font-semibold text-ceal-ink focus-ring hover:bg-ceal-sunGlow"
          >
            Join the roster
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {participants.map((p) => (
            <li key={p.handle}>
              <ParticipantCard participant={p} />
            </li>
          ))}
        </ul>
      )}

      {participants.length > 0 ? (
        <p className="mt-8 text-sm text-ceal-muted">
          Peers still joining?{' '}
          <Link href="/join" className="font-medium text-ceal-leaf underline focus-ring rounded">
            Submit your profile →
          </Link>
        </p>
      ) : null}
    </section>
  );
}

function ParticipantCard({ participant: p }: { participant: Participant }) {
  return (
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
  );
}
