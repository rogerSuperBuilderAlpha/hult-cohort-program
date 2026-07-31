import type { Participant } from '@/data/participants';
import { thoughtLeader } from '@/data/thought-leader';
import { positioning } from '@/data/cohort';

type Props = {
  participant: Participant;
};

export function ActiveProfile({ participant }: Props) {
  const isThoughtLeader = participant.handle === 'ryanroper79-alt';

  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Builder profile</p>
      <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">{participant.name}</h1>
      <p className="mt-2 font-mono text-sm text-ceal-muted">@{participant.handle}</p>
      <p className="mt-6 max-w-prose text-xl leading-relaxed text-ceal-ink">{participant.headline}</p>

      {isThoughtLeader ? (
        <aside className="mt-8 rounded-lg border border-ceal-sun bg-ceal-panel p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-ceal-leaf">Thought leader</p>
          <p className="mt-2 font-display text-2xl text-ceal-mangrove">{thoughtLeader.name}</p>
          <p className="mt-2 text-ceal-muted">{thoughtLeader.bio}</p>
          <ul className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
            <li>
              <a
                href={thoughtLeader.linkedin}
                className="text-ceal-leaf underline focus-ring rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn →
              </a>
            </li>
            <li>
              <a href={thoughtLeader.github} className="text-ceal-leaf underline focus-ring rounded">
                GitHub →
              </a>
            </li>
          </ul>
        </aside>
      ) : null}

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ceal-mangrove">Links</h2>
        <ul className="mt-4 space-y-2 text-ceal-leaf">
          {participant.links.github ? (
            <li>
              <a href={participant.links.github} className="underline focus-ring rounded" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
          ) : null}
          {participant.links.linkedin ? (
            <li>
              <a href={participant.links.linkedin} className="underline focus-ring rounded" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
          ) : null}
          {participant.links.site ? (
            <li>
              <a href={participant.links.site} className="underline focus-ring rounded" target="_blank" rel="noopener noreferrer">
                Site
              </a>
            </li>
          ) : null}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ceal-mangrove">Shipped work</h2>
        {participant.projects.length === 0 ? (
          <p className="mt-4 text-ceal-muted">Evidence publishing as submissions merge.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {participant.projects.map((project) => (
              <li
                key={`${project.week}-${project.title}`}
                className="rounded-lg border border-ceal-line bg-ceal-panel p-5"
              >
                <p className="font-mono text-xs uppercase text-ceal-leaf">Week {project.week}</p>
                <h3 className="mt-1 font-display text-xl text-ceal-mangrove">{project.title}</h3>
                <p className="mt-2 text-ceal-muted">{project.summary}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
                  {project.liveUrl ? (
                    <a href={project.liveUrl} className="text-ceal-leaf underline focus-ring rounded" target="_blank" rel="noopener noreferrer">
                      Live deploy →
                    </a>
                  ) : null}
                  {project.prUrl ? (
                    <a href={project.prUrl} className="text-ceal-leaf underline focus-ring rounded" target="_blank" rel="noopener noreferrer">
                      Merged PR →
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-12 text-sm text-ceal-muted">
        <a href={positioning.contactHref} className="text-ceal-leaf underline focus-ring rounded">
          {positioning.partnerAsk}
        </a>
      </p>
    </article>
  );
}

export function PendingProfile({ participant }: Props) {
  return (
    <article className="rounded-lg border border-dashed border-ceal-leaf bg-ceal-panel p-10 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Profile pending</p>
      <h1 className="mt-4 font-display text-3xl text-ceal-mangrove">@{participant.handle}</h1>
      <p className="mx-auto mt-4 max-w-md text-ceal-muted">
        This builder joins the public roster during review week. The cohort is still filling — pending
        means momentum, not absence.
      </p>
      {participant.links.github ? (
        <p className="mt-6">
          <a
            href={participant.links.github}
            className="font-medium text-ceal-leaf underline focus-ring rounded"
            target="_blank"
            rel="noopener noreferrer"
          >
            Inspect GitHub while the profile publishes →
          </a>
        </p>
      ) : null}
    </article>
  );
}
