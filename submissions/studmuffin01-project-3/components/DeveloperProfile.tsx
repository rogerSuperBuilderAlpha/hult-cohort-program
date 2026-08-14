import Link from "next/link";
import { SampleDataBadge } from "@/components/SampleDataBadge";
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
    <div className="space-y-10">
      <Link
        href="/developers"
        className="font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.12em] text-[var(--signal)] hover:underline"
      >
        ← Developers
      </Link>

      {/* Hero identity */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {person.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.photoUrl}
            alt=""
            className="h-20 w-20 border border-[var(--line-strong)] object-cover"
          />
        ) : (
          <span className="flex h-20 w-20 shrink-0 items-center justify-center border border-[var(--line-strong)] bg-[var(--signal-soft)] font-[family-name:var(--font-jetbrains)] text-lg font-semibold text-[var(--signal)]">
            {person.photoInitials}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-jetbrains)] text-[11px] text-[var(--ink-faint)]">
            @{person.handle} · {person.campus} · {person.role}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight sm:text-4xl">
            {person.name}
            {person.isDemo ? (
              <SampleDataBadge className="ml-2 align-middle" />
            ) : null}
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--ink-muted)]">{person.headline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {person.skills.map((skill) => (
              <span
                key={skill}
                className="border border-[var(--line)] px-2 py-1 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.1em] text-[var(--ink-muted)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-8">
          {/* Why I'm Here */}
          <section>
            <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
              Why I&apos;m Here
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
              {person.whyImHere}
            </p>
          </section>

          {/* Public Build Log */}
          <section>
            <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
              Public Build Log
            </h2>
            <ul className="mt-4 space-y-3">
              {person.buildLog.map((entry) => (
                <li
                  key={`${entry.week}-${entry.title}`}
                  className="border-l-2 border-[var(--signal)] pl-3"
                >
                  <p className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                    {entry.week}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--ink)]">{entry.title}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Links */}
          <section>
            <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
              Links
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {links.github ? (
                <ExtLink href={links.github} label="GitHub" />
              ) : person.isDemo ? (
                <p className="text-sm text-[var(--ink-muted)]">
                  No social links on sample profiles (avoids linking to real
                  strangers).
                </p>
              ) : null}
              {links.linkedin ? (
                <ExtLink href={links.linkedin} label="LinkedIn" />
              ) : null}
              {links.x ? <ExtLink href={links.x} label="X" /> : null}
              {links.portfolio ? (
                <ExtLink href={links.portfolio} label="Portfolio" />
              ) : null}
              {links.deployment ? (
                <ExtLink href={links.deployment} label="Primary deploy" />
              ) : null}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Project Showcase */}
          <section className="border border-[var(--line)] bg-[var(--bg-elevated)] p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
                Project showcase
              </h2>
              <Link
                href="/projects"
                className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.12em] text-[var(--signal)] hover:underline"
              >
                All project pages →
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h3 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
                {project.title}
              </h3>
              <StatusBadge live={statusLive} />
            </div>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">{project.tagline}</p>

            <div className="mt-6 space-y-6">
              <div>
                <h4 className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.14em] text-[var(--signal)]">
                  Problem
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                  {project.problem}
                </p>
              </div>

              {project.solutionItems.length > 0 ? (
                <div>
                  <h4 className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.14em] text-[var(--signal)]">
                    Solution
                  </h4>
                  <ul className="mt-3 space-y-3">
                    {project.solutionItems.map((item) => (
                      <li
                        key={item.label}
                        className="border border-[var(--line)] bg-[var(--bg)] p-3"
                      >
                        <p className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                          {MEDIA_KIND_LABEL[item.kind] ?? item.kind}
                        </p>
                        <p className="mt-1 text-sm font-medium">{item.label}</p>
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
                            className="mt-2 inline-block text-sm text-[var(--signal)] underline"
                          >
                            Open
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {project.proofOfWork.length > 0 ? (
                <div>
                  <h4 className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.14em] text-[var(--signal)]">
                    Proof of Work
                  </h4>
                  <ul className="mt-3 space-y-2">
                    {project.proofOfWork.map((item) => (
                      <li key={item.label} className="text-sm">
                        <span className="font-medium text-[var(--ink)]">
                          {item.label}
                        </span>
                        <span className="text-[var(--ink-muted)]">
                          {" "}
                          — {item.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : person.isDemo ? (
                <p className="text-sm text-[var(--ink-muted)]">
                  Sample profiles do not claim proof of work or fabricated
                  repos.
                </p>
              ) : null}

              {project.liveAppUrl || project.repoUrl || project.docsUrl ? (
                <div>
                  <h4 className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.14em] text-[var(--signal)]">
                    Deployment
                  </h4>
                  <div className="mt-3 space-y-2">
                    {project.liveAppUrl ? (
                      <DeployRow label="Live app" href={project.liveAppUrl} />
                    ) : null}
                    {project.repoUrl ? (
                      <DeployRow label="Repo" href={project.repoUrl} />
                    ) : null}
                    {project.docsUrl ? (
                      <DeployRow label="Docs" href={project.docsUrl} />
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {/* Activity */}
          <section>
            <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
              Activity feed
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Seeded activity for this profile — not a live webhook feed.
            </p>
            <ul className="mt-4 divide-y divide-[var(--line)] border border-[var(--line)] bg-[var(--bg-elevated)]">
              {person.activity.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <span className="text-sm text-[var(--ink)]">{item.text}</span>
                  <span className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                    {formatActivityWhen(item.when)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Partner CTA */}
          <section className="border border-[var(--line)] bg-[var(--bg-elevated)] p-5">
            <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold">
              For partners
            </h2>
            <p className="mt-1 text-sm font-medium">Interested?</p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Request an intro on the Partners page — placement lead routes the
              conversation.
              {person.isDemo
                ? " Sample profiles cannot receive intro requests."
                : ""}
            </p>
            {!person.isDemo ? (
              <Link
                href={`/partners?developer=${person.handle}`}
                className="mt-4 inline-flex border border-[var(--signal)] bg-[var(--signal)] px-4 py-2.5 text-sm font-semibold text-[var(--bg)]"
              >
                Request intro
              </Link>
            ) : (
              <p className="mt-4">
                <SampleDataBadge />
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function ExtLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-[var(--signal)] underline"
    >
      {label}
    </a>
  );
}

function DeployRow({ label, href }: { label: string; href: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm">
      <span className="text-[var(--ink-muted)]">{label}</span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--signal)] underline"
      >
        Open
      </a>
    </div>
  );
}
