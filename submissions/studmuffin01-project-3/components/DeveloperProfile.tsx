import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { MEDIA_KIND_LABEL } from "@/lib/media";
import type { Person } from "@/lib/types";

function formatActivityWhen(when: string): string {
  if (when.includes("ago") || when === "Yesterday") return when;
  const date = new Date(when);
  if (Number.isNaN(date.getTime())) return when;
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function DeveloperProfile({ person }: { person: Person }) {
  const { featuredProject: project, links } = person;
  const statusLive = project.status === "live";

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <Link
        href="/developers"
        className="font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.12em] text-[var(--ink-faint)] hover:text-[var(--signal)]"
      >
        ← Developers
      </Link>

      {/* Hero identity */}
      <header className="mt-6 flex flex-col gap-6 border-b border-[var(--line)] pb-10 sm:flex-row sm:items-end">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden border border-[var(--line-strong)] bg-[var(--signal-soft)] sm:h-32 sm:w-32">
          {person.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={person.photoUrl}
              alt={person.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-[family-name:var(--font-jetbrains)] text-2xl font-semibold text-[var(--signal)]">
              {person.photoInitials}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            @{person.handle} · {person.campus} · {person.role}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-syne)] text-4xl font-bold tracking-tight sm:text-5xl">
            {person.name}
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--ink-muted)]">{person.headline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {person.skills.map((skill) => (
              <span
                key={skill}
                className="border border-[var(--line)] bg-[var(--bg-elevated)] px-2.5 py-1 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.1em] text-[var(--ink-muted)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_17rem]">
        <div className="min-w-0 space-y-14">
          {/* Why I'm Here */}
          <section>
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-tight">
              Why I&apos;m Here
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--ink-muted)]">
              {person.whyImHere}
            </p>
          </section>

          {/* Public Build Log */}
          <section>
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-tight">
              Public Build Log
            </h2>
            <ol className="mt-5 border border-[var(--line)] bg-[var(--bg-elevated)]">
              {person.buildLog.map((entry) => (
                <li
                  key={`${entry.week}-${entry.title}`}
                  className="flex flex-col gap-1 border-b border-[var(--line)] px-4 py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <span className="shrink-0 font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--signal)]">
                    {entry.week}
                  </span>
                  <span className="text-sm text-[var(--ink)]">{entry.title}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Links */}
          <section>
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-tight">
              Links
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              <ExtLink href={links.github} label="GitHub" />
              {links.linkedin ? (
                <ExtLink href={links.linkedin} label="LinkedIn" />
              ) : null}
              {links.x ? <ExtLink href={links.x} label="X" /> : null}
              {links.portfolio ? (
                <ExtLink href={links.portfolio} label="Portfolio" />
              ) : null}
              {links.deployment ? (
                <ExtLink href={links.deployment} label="Deployment" />
              ) : null}
            </ul>
          </section>

          {/* Project Showcase — full public pages live under /projects/[id] */}
          <section className="border border-[var(--line)] bg-[var(--bg-elevated)] p-5 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-[family-name:var(--font-jetbrains)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--signal)]">
                Project showcase
              </p>
              <Link
                href="/projects"
                className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)] hover:text-[var(--signal)]"
              >
                All project pages →
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight">
                  {project.title}
                </h2>
                <p className="mt-2 max-w-xl text-[var(--ink-muted)]">
                  {project.tagline}
                </p>
              </div>
              <StatusBadge live={statusLive} />
            </div>

            <div className="mt-10 space-y-10">
              <div>
                <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold">
                  Problem
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
                  {project.problem}
                </p>
              </div>

              <div>
                <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold">
                  Solution
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {project.solutionItems.map((item) => (
                    <li
                      key={item.label}
                      className="border border-[var(--line)] bg-[var(--bg)] p-4"
                    >
                      <p className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.12em] text-[var(--signal)]">
                        {MEDIA_KIND_LABEL[item.kind] ?? item.kind}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                        {item.label}
                      </p>
                      {item.description ? (
                        <p className="mt-1 text-sm text-[var(--ink-muted)]">
                          {item.description}
                        </p>
                      ) : null}
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.12em] text-[var(--signal)] hover:underline"
                        >
                          Open
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold">
                  Proof of Work
                </h3>
                <ul className="mt-4 space-y-2">
                  {project.proofOfWork.map((item) => (
                    <li
                      key={item.label}
                      className="flex flex-col gap-0.5 border border-[var(--line)] bg-[var(--bg)] px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4"
                    >
                      <span className="shrink-0 font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ink)]">
                        {item.label}
                      </span>
                      <span className="text-sm text-[var(--ink-muted)]">
                        {item.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold">
                  Deployment
                </h3>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <StatusBadge live={statusLive} />
                </div>
                <ul className="mt-4 space-y-2">
                  {project.liveAppUrl ? (
                    <DeployRow
                      label="Live application"
                      href={project.liveAppUrl}
                    />
                  ) : null}
                  {project.repoUrl ? (
                    <DeployRow
                      label="GitHub repository"
                      href={project.repoUrl}
                    />
                  ) : null}
                  {project.docsUrl ? (
                    <DeployRow
                      label="Technical documentation"
                      href={project.docsUrl}
                    />
                  ) : null}
                </ul>
              </div>
            </div>
          </section>

          {/* Live Activity Feed */}
          <section>
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-tight">
              Live Activity Feed
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-faint)]">
              Social proof from this builder&apos;s recent trail.
            </p>
            <ul className="mt-5 border border-[var(--line)] bg-[var(--bg-elevated)]">
              {person.activity.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-1 border-b border-[var(--line)] px-4 py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <span className="text-sm text-[var(--ink)]">{item.text}</span>
                  <span className="shrink-0 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                    {formatActivityWhen(item.when)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Compact partner CTA — full form lives on /partners */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="border border-[var(--line)] bg-[var(--bg-elevated)] p-5">
            <p className="font-[family-name:var(--font-jetbrains)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--signal)]">
              For partners
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-syne)] text-xl font-semibold">
              Interested?
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Request an intro on the Partners page — placement lead routes the
              conversation.
            </p>
            <Link
              href={`/partners?developer=${encodeURIComponent(person.handle)}`}
              className="mt-5 inline-flex h-11 w-full items-center justify-center bg-[var(--signal)] px-4 font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--signal-ink)] transition hover:brightness-110"
            >
              Request intro
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ExtLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center border border-[var(--line-strong)] bg-[var(--bg-elevated)] px-3 font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink)] transition hover:border-[var(--signal)] hover:text-[var(--signal)]"
      >
        {label}
      </a>
    </li>
  );
}

function DeployRow({ label, href }: { label: string; href: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-3 border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm transition hover:border-[var(--signal)]"
      >
        <span>{label}</span>
        <span className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.1em] text-[var(--signal)]">
          Open
        </span>
      </a>
    </li>
  );
}
