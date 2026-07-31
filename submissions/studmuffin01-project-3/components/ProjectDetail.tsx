import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { MEDIA_KIND_LABEL } from "@/lib/media";
import type { ShowcaseProject } from "@/lib/projects";

export function ProjectDetail({ project }: { project: ShowcaseProject }) {
  const live = project.deployBadge === "live";

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
      <Link
        href="/projects"
        className="font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.12em] text-[var(--ink-faint)] hover:text-[var(--signal)]"
      >
        ← Projects
      </Link>

      <header className="mt-6 border-b border-[var(--line)] pb-8">
        <p className="font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
          {project.phase}
        </p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-syne)] text-4xl font-bold tracking-tight sm:text-5xl">
              {project.name}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-[var(--ink-muted)]">
              {project.tagline}
            </p>
            <p className="mt-4 font-[family-name:var(--font-jetbrains)] text-[11px] text-[var(--ink-faint)]">
              Owner{" "}
              <Link
                href={`/developers/${project.ownerHandle}`}
                className="text-[var(--signal)] hover:underline"
              >
                @{project.ownerHandle}
              </Link>
            </p>
          </div>
          <StatusBadge live={live} />
        </div>
      </header>

      <div className="mt-10 space-y-12">
        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold">
            Problem
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--ink-muted)]">
            {project.problem}
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold">
            Solution
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {project.solutionItems.map((item) => (
              <li
                key={item.label}
                className="border border-[var(--line)] bg-[var(--bg-elevated)] p-4"
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
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold">
            Proof of Work
          </h2>
          <ul className="mt-5 space-y-2">
            {project.proofOfWork.map((item) => (
              <li
                key={item.label}
                className="flex flex-col gap-0.5 border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4"
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
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold">
            Deployment
          </h2>
          <div className="mt-4">
            <StatusBadge live={live} />
          </div>
          <ul className="mt-4 space-y-2">
            {project.deployUrl ? (
              <DeployRow label="Live application" href={project.deployUrl} />
            ) : (
              <li className="border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--ink-muted)]">
                Live application — coming soon
              </li>
            )}
            {project.repoUrl ? (
              <DeployRow label="GitHub repository" href={project.repoUrl} />
            ) : null}
            {project.docsUrl ? (
              <DeployRow
                label="Technical documentation"
                href={project.docsUrl}
              />
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}

function DeployRow({ label, href }: { label: string; href: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-3 border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3 text-sm transition hover:border-[var(--signal)]"
      >
        <span>{label}</span>
        <span className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.1em] text-[var(--signal)]">
          Open
        </span>
      </a>
    </li>
  );
}
