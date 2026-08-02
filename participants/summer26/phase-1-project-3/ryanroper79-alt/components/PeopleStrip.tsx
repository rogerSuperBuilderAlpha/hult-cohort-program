import Link from 'next/link';
import Image from 'next/image';
import { participants, type Participant } from '@/data/participants';

function sortedParticipants() {
  return [...participants].sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function PeopleStrip() {
  const roster = sortedParticipants();

  return (
    <section aria-labelledby="people-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="people-heading" className="font-display text-3xl text-ceal-mangrove">
            Cohort participants
          </h2>
          <p className="mt-3 max-w-prose text-ceal-muted">
            Every enrolled handle gets a profile page. Opt-outs show a private placeholder. Set{' '}
            <code className="rounded bg-ceal-panel px-1 py-0.5 font-mono text-xs">
              availableForEngagement
            </code>{' '}
            yourself via the{' '}
            <Link href="/join" className="text-ceal-leaf underline focus-ring rounded">
              /join
            </Link>{' '}
            PR flow — never preset by maintainers.
          </p>
        </div>
        <Link href="/work" className="text-sm font-medium text-ceal-leaf underline focus-ring rounded">
          Work ledger →
        </Link>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roster.map((p) => (
          <li key={p.handle}>
            <ParticipantCard participant={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ParticipantCard({ participant: p }: { participant: Participant }) {
  const photo = p.photoPath ?? p.avatarUrl;

  return (
    <Link
      href={`/p/${p.handle}`}
      className={`block h-full rounded-lg border p-5 transition focus-ring hover:border-ceal-leaf ${
        p.privacy === 'private'
          ? 'border-dashed border-ceal-line bg-ceal-panel'
          : 'border-ceal-line bg-ceal-panel'
      }`}
    >
      <div className="flex items-start gap-3">
        {photo && p.privacy !== 'private' ? (
          <Image
            src={photo}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full border border-ceal-line object-cover"
          />
        ) : null}
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-ceal-leaf">
            {p.privacy === 'private' ? 'Private profile' : 'Participant'}
          </p>
          <p className="mt-1 font-display text-xl text-ceal-mangrove">{p.displayName}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-ceal-muted line-clamp-3">
        {p.privacy === 'private' ? 'Opted out of public bio — listed for roster completeness.' : p.headline}
      </p>
      {p.availableForEngagement ? (
        <p className="mt-2 font-mono text-[10px] uppercase text-ceal-leaf">Open to engagement</p>
      ) : null}
    </Link>
  );
}
