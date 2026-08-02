import Image from 'next/image';
import Link from 'next/link';
import { featuredBuilder } from '@/data/featured-builder';
import { participants, type Participant } from '@/data/participants';

function sortedParticipants() {
  return [...participants].sort((a, b) => {
    if (a.handle === featuredBuilder.handle) return -1;
    if (b.handle === featuredBuilder.handle) return 1;
    return a.displayName.localeCompare(b.displayName);
  });
}

export function BuildersDirectory() {
  const builders = sortedParticipants();

  return (
    <section aria-labelledby="builders-directory-heading">
      <h2 id="builders-directory-heading" className="font-display text-3xl text-ceal-mangrove">
        Meet the builders
      </h2>
      <p className="mt-3 max-w-prose text-ceal-muted">
        The people behind the projects — skills, stories, and what they&apos;re building next. Ryan R.
        Roper leads CEAL Green and operates this showcase.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {builders.map((p) => (
          <li key={p.handle}>
            <BuilderCard participant={p} featured={p.handle === featuredBuilder.handle} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function BuilderCard({ participant: p, featured }: { participant: Participant; featured?: boolean }) {
  const photo = p.photoPath ?? (featured ? featuredBuilder.photoPath : undefined);

  return (
    <Link
      href={`/p/${p.handle}`}
      className={`block h-full rounded-lg border p-5 transition focus-ring hover:border-ceal-leaf ${
        featured
          ? 'border-ceal-sun bg-gradient-to-br from-ceal-panel to-ceal-sunGlow/20'
          : 'border-ceal-line bg-ceal-panel'
      }`}
    >
      <div className="flex items-start gap-4">
        {photo ? (
          <Image
            src={photo}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-full border border-ceal-line object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ceal-leaf/20 font-display text-lg text-ceal-mangrove">
            {p.displayName.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-wider text-ceal-leaf">
            {featured ? 'Featured builder' : 'Cohort builder'}
          </p>
          <p className="mt-1 font-display text-xl text-ceal-mangrove">{p.displayName}</p>
          {p.location ? <p className="mt-0.5 text-xs text-ceal-muted">{p.location}</p> : null}
        </div>
      </div>
      <p className="mt-3 text-sm text-ceal-muted line-clamp-3">{p.headline}</p>
      {p.skills && p.skills.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {p.skills.slice(0, 4).map((s) => (
            <li key={s} className="rounded bg-ceal-white/80 px-2 py-0.5 font-mono text-[10px] uppercase text-ceal-muted">
              {s}
            </li>
          ))}
        </ul>
      ) : null}
    </Link>
  );
}
