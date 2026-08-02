import Link from 'next/link';
import Image from 'next/image';
import { featuredBuilder } from '@/data/featured-builder';
import { participants, type Participant } from '@/data/participants';

function sortedParticipants() {
  return [...participants].sort((a, b) => {
    if (a.featured) return -1;
    if (b.featured) return 1;
    return a.displayName.localeCompare(b.displayName);
  });
}

export function PeopleStrip() {
  const roster = sortedParticipants();

  return (
    <section aria-labelledby="people-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="people-heading" className="font-display text-3xl text-ceal-mangrove">
            Meet the cohort
          </h2>
          <p className="mt-3 max-w-prose text-ceal-muted">
            Practitioners and first-time shippers on the same roster — led by Ryan R. Roper for
            Caribbean infrastructure and digital/AI delivery.
          </p>
        </div>
        <Link href="/builders" className="text-sm font-medium text-ceal-leaf underline focus-ring rounded">
          Full directory →
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
  const photo = p.photoPath ?? (p.featured ? featuredBuilder.photoPath : undefined);

  return (
    <Link
      href={`/p/${p.handle}`}
      className={`block h-full rounded-lg border p-5 transition focus-ring hover:border-ceal-leaf ${
        p.featured
          ? 'border-ceal-sun bg-gradient-to-br from-ceal-panel to-ceal-sunGlow/20'
          : 'border-ceal-line bg-ceal-panel'
      }`}
    >
      <div className="flex items-start gap-3">
        {photo ? (
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
            {p.featured ? 'Featured builder' : 'Cohort builder'}
          </p>
          <p className="mt-1 font-display text-xl text-ceal-mangrove">{p.displayName}</p>
          {p.location ? <p className="text-xs text-ceal-muted">{p.location}</p> : null}
        </div>
      </div>
      <p className="mt-3 text-sm text-ceal-muted line-clamp-3">{p.headline}</p>
      {p.skills && p.skills.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1">
          {p.skills.slice(0, 3).map((s) => (
            <li key={s} className="rounded bg-ceal-white/70 px-1.5 py-0.5 font-mono text-[10px] text-ceal-muted">
              {s}
            </li>
          ))}
        </ul>
      ) : null}
    </Link>
  );
}
