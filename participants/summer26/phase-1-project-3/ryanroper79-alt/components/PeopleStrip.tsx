import Link from 'next/link';
import type { Participant } from '@/data/participants';
import { participants } from '@/data/participants';

export function PeopleStrip() {
  return (
    <section aria-labelledby="people-heading">
      <h2 id="people-heading" className="font-display text-3xl text-ceal-mangrove">
        The cohort
      </h2>
      <p className="mt-3 max-w-prose text-ceal-muted">
        Every enrolled builder has a published profile — practitioners and first-time shippers on
        the same roster. Send a pull request to update yours.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {participants.map((p) => (
          <li key={p.handle}>
            <ParticipantCard participant={p} />
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-ceal-muted">
        Not on the roster yet?{' '}
        <Link href="/join" className="font-medium text-ceal-leaf underline focus-ring rounded">
          Submit your profile →
        </Link>
      </p>
    </section>
  );
}

function ParticipantCard({ participant: p }: { participant: Participant }) {
  return (
    <Link
      href={`/p/${p.handle}`}
      className="block h-full rounded-lg border border-ceal-line bg-ceal-panel p-5 transition hover:border-ceal-leaf focus-ring"
    >
      <p className="font-mono text-xs uppercase tracking-wider text-ceal-leaf">Cohort builder</p>
      <p className="mt-2 font-display text-xl text-ceal-mangrove">{p.displayName}</p>
      <p className="mt-1 font-mono text-xs text-ceal-muted">@{p.handle}</p>
      <p className="mt-2 text-sm text-ceal-muted line-clamp-3">{p.headline}</p>
    </Link>
  );
}
