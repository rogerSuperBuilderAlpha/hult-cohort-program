import Image from 'next/image';
import Link from 'next/link';
import { featuredBuilder } from '@/data/featured-builder';
import { positioning } from '@/data/cohort';

type Props = {
  variant?: 'full' | 'compact';
};

export function FeaturedBuilderSpotlight({ variant = 'full' }: Props) {
  const b = featuredBuilder;

  if (variant === 'compact') {
    return (
      <Link
        href={`/p/${b.handle}`}
        className="flex gap-4 rounded-lg border border-ceal-sun bg-gradient-to-br from-ceal-panel to-ceal-sunGlow/20 p-5 transition hover:border-ceal-leaf focus-ring"
      >
        <Image
          src={b.photoPath}
          alt={b.displayName}
          width={72}
          height={72}
          className="h-[72px] w-[72px] shrink-0 rounded-full border-2 border-ceal-leaf object-cover"
        />
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-ceal-leaf">Featured builder</p>
          <p className="mt-1 font-display text-xl text-ceal-mangrove">{b.displayName}</p>
          <p className="mt-1 text-sm text-ceal-muted line-clamp-2">{b.headline}</p>
        </div>
      </Link>
    );
  }

  return (
    <section aria-labelledby="featured-builder-heading" className="rounded-xl border border-ceal-sun bg-gradient-to-br from-ceal-white via-ceal-panel to-ceal-sunGlow/25 p-8 md:p-10">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Featured builder</p>
      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
        <Image
          src={b.photoPath}
          alt={b.displayName}
          width={200}
          height={200}
          className="mx-auto h-[200px] w-[200px] shrink-0 rounded-full border-4 border-ceal-leaf object-cover shadow-md lg:mx-0"
          priority
        />
        <div className="flex-1">
          <h2 id="featured-builder-heading" className="font-display text-3xl text-ceal-mangrove md:text-4xl">
            {b.displayName}
          </h2>
          <p className="mt-1 text-sm font-medium text-ceal-leaf">{b.title} · {b.location}</p>
          <p className="mt-4 text-lg leading-relaxed text-ceal-ink">{b.headline}</p>
          <p className="mt-4 text-ceal-muted leading-relaxed">{b.bio}</p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {b.credentials.map((c) => (
              <li
                key={c}
                className="rounded-full border border-ceal-leaf/40 bg-ceal-white px-3 py-1 text-xs font-medium text-ceal-mangrove"
              >
                {c}
              </li>
            ))}
          </ul>

          <ul className="mt-4 flex flex-wrap gap-2">
            {b.skills.map((s) => (
              <li key={s} className="rounded-md bg-ceal-panel px-2.5 py-1 font-mono text-xs text-ceal-muted">
                {s}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/p/${b.handle}`}
              className="inline-block rounded-md bg-ceal-mangrove px-5 py-3 text-sm font-semibold text-ceal-white focus-ring hover:opacity-90"
            >
              View full profile →
            </Link>
            <a
              href={b.linkedin}
              className="inline-block rounded-md border border-ceal-mangrove px-5 py-3 text-sm font-semibold text-ceal-mangrove focus-ring hover:bg-ceal-panel"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn →
            </a>
            <a
              href={positioning.cealGreenUrl}
              className="inline-block rounded-md border border-ceal-line px-5 py-3 text-sm font-semibold text-ceal-muted focus-ring hover:bg-ceal-panel"
              target="_blank"
              rel="noopener noreferrer"
            >
              CEAL Green commercial work →
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {b.whyPartner.map((item) => (
          <div key={item.title} className="rounded-lg border border-ceal-line bg-ceal-white/80 p-5">
            <h3 className="font-display text-lg text-ceal-mangrove">{item.title}</h3>
            <p className="mt-2 text-sm text-ceal-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
