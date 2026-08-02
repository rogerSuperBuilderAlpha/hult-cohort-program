import Link from 'next/link';
import Image from 'next/image';
import type { Participant } from '@/data/participants';
import { participantProjects } from '@/data/participants';
import { participantsEditUrl } from '@/data/constants';
import { featuredBuilder } from '@/data/featured-builder';
import type { LedgerEntry } from '@/data/ledger';

type Props = { participant: Participant };

function LedgerProjectList({ entries }: { entries: LedgerEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="mt-4 text-ceal-muted">
        No ledger entries indexed yet —{' '}
        <span className="rounded-full border border-dashed border-ceal-line px-2 py-0.5 font-mono text-xs">
          not yet indexed
        </span>
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-4">
      {entries.map((entry) => (
        <li
          key={`${entry.week}-${entry.projectSlug}`}
          className="rounded-lg border border-ceal-line bg-ceal-panel p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs uppercase text-ceal-leaf">Week {entry.week}</p>
            {entry.status === 'not-indexed' ? (
              <span className="rounded-full border border-dashed border-ceal-line px-2 py-0.5 font-mono text-xs text-ceal-muted">
                not yet indexed
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 font-display text-xl text-ceal-mangrove">{entry.title}</h3>
          <p className="mt-2 text-ceal-muted">{entry.summary}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
            {entry.deployUrl ? (
              <a
                href={entry.deployUrl}
                className="text-ceal-leaf underline focus-ring rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                Live deploy →
              </a>
            ) : null}
            {entry.prUrl ? (
              <a
                href={entry.prUrl}
                className="text-ceal-leaf underline focus-ring rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                {entry.prNumber ? `PR #${entry.prNumber}` : 'Evidence →'}
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ProfileView({ participant }: Props) {
  const entries = participantProjects(participant.handle);
  const isStub = participant.status === 'stub';
  const isPrivate = participant.privacy === 'private';
  const isRyan = participant.handle === featuredBuilder.handle;
  const photo = participant.photoPath ?? (isRyan ? featuredBuilder.photoPath : participant.avatarUrl);

  if (isPrivate) {
    return (
      <article>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Private profile</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">{participant.displayName}</h1>
        <p className="mt-2 font-mono text-sm text-ceal-muted">@{participant.handle}</p>
        <div className="mt-8 rounded-lg border border-dashed border-ceal-line bg-ceal-panel p-6 md:p-8">
          <p className="text-lg text-ceal-muted">
            This enrolled participant opted out of a full public profile. Placement can still route
            confidential introductions — use the{' '}
            <Link href="/partners#inquiry" className="text-ceal-leaf underline focus-ring rounded">
              partner enquiry form
            </Link>{' '}
            and name their handle.
          </p>
        </div>
      </article>
    );
  }

  return (
    <article>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {photo ? (
          <Image
            src={photo}
            alt={participant.displayName}
            width={isRyan ? 160 : 96}
            height={isRyan ? 160 : 96}
            className={`shrink-0 rounded-full border-2 border-ceal-leaf object-cover ${
              isRyan ? 'h-40 w-40' : 'h-24 w-24'
            }`}
            priority={isRyan}
          />
        ) : null}
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">
            {isRyan ? 'Featured builder' : 'Builder profile'}
          </p>
          <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">
            {participant.displayName}
          </h1>
          {participant.location ? (
            <p className="mt-2 text-sm font-medium text-ceal-leaf">{participant.location}</p>
          ) : null}
          <p className="mt-2 font-mono text-sm text-ceal-muted">@{participant.handle}</p>
          <p className="mt-6 max-w-prose text-xl leading-relaxed text-ceal-ink">{participant.headline}</p>
        </div>
      </div>

      {isRyan ? (
        <section className="mt-10 rounded-xl border border-ceal-sun bg-ceal-panel p-6 md:p-8">
          <h2 className="font-display text-2xl text-ceal-mangrove">Why partner with Ryan</h2>
          <p className="mt-4 text-ceal-muted leading-relaxed">{featuredBuilder.bio}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {featuredBuilder.credentials.map((c) => (
              <li
                key={c}
                className="rounded-full border border-ceal-leaf/40 bg-ceal-white px-3 py-1 text-xs font-medium text-ceal-mangrove"
              >
                {c}
              </li>
            ))}
          </ul>
          {participant.skills && participant.skills.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {participant.skills.map((s) => (
                <li key={s} className="rounded-md bg-ceal-white px-2 py-1 font-mono text-xs text-ceal-muted">
                  {s}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/partners#inquiry"
              className="inline-block rounded-md bg-ceal-mangrove px-5 py-3 text-sm font-semibold text-ceal-white focus-ring hover:opacity-90"
            >
              Partner enquiry →
            </Link>
            <a
              href={featuredBuilder.cealGreenUrl}
              className="inline-block rounded-md border border-ceal-mangrove px-5 py-3 text-sm font-semibold text-ceal-mangrove focus-ring hover:bg-ceal-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              CEAL Green commercial work →
            </a>
          </div>
        </section>
      ) : null}

      {isStub ? (
        <aside className="mt-8 rounded-lg border border-ceal-sun bg-ceal-panel p-6">
          <p className="font-medium text-ceal-mangrove">This is your profile — send a PR to edit it →</p>
          <p className="mt-2 text-sm text-ceal-muted">
            Add your headline and links in{' '}
            <code className="rounded bg-ceal-white px-1 py-0.5 font-mono text-xs">data/participants.ts</code>{' '}
            on the showcase repo.
          </p>
          <a
            href={participantsEditUrl}
            className="mt-4 inline-block text-sm font-medium text-ceal-leaf underline focus-ring rounded"
            target="_blank"
            rel="noopener noreferrer"
          >
            Edit participants.ts on GitHub →
          </a>
        </aside>
      ) : null}

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ceal-mangrove">Links</h2>
        <ul className="mt-4 space-y-2 text-ceal-leaf">
          {participant.links.github ? (
            <li>
              <a
                href={participant.links.github}
                className="underline focus-ring rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
          ) : null}
          {participant.links.linkedin ? (
            <li>
              <a
                href={participant.links.linkedin}
                className="underline focus-ring rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
          ) : null}
          {participant.links.site ? (
            <li>
              <a
                href={participant.links.site}
                className="underline focus-ring rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                Site
              </a>
            </li>
          ) : null}
          {participant.links.blog ? (
            <li>
              <a
                href={participant.links.blog}
                className="underline focus-ring rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                Blog
              </a>
            </li>
          ) : null}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ceal-mangrove">Shipped work</h2>
        <LedgerProjectList entries={entries} />
      </section>

      <p className="mt-12 text-sm text-ceal-muted">
        Full cross-cohort index:{' '}
        <Link href="/work" className="text-ceal-leaf underline focus-ring rounded">
          /work
        </Link>
      </p>
    </article>
  );
}
