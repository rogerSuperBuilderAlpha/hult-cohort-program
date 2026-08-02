"use client";

import type { ShowcaseProject } from "@/lib/types";
import { ArchitectureInspector } from "./ArchitectureInspector";

export function ShowcaseProjectCard({ project }: { project: ShowcaseProject }) {
  return (
    <article className="glass-card rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--accent)]">
            @{project.ownerHandle}
          </p>
          <h3 className="mt-1 font-display text-xl font-bold">{project.title}</h3>
        </div>
        <div className="flex gap-2">
          <a
            href={project.deployUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            Live deploy
          </a>
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-sm"
          >
            Repository
          </a>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-mono text-[10px] uppercase text-[var(--ink-muted)]">
            Problem
          </dt>
          <dd className="mt-1 text-[var(--ink-muted)]">{project.problem}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase text-[var(--ink-muted)]">
            Speed to market
          </dt>
          <dd className="mt-1 text-[var(--ink-muted)]">{project.speedToMarket}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase text-[var(--ink-muted)]">
            Complexity
          </dt>
          <dd className="mt-1 text-[var(--ink-muted)]">{project.complexity}</dd>
        </div>
      </dl>

      <ArchitectureInspector project={project} />

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded border border-[var(--glass-border)] px-2 py-0.5 font-mono text-[10px]"
          >
            {s}
          </span>
        ))}
      </div>
    </article>
  );
}

export function ShowcaseGrid({ projects }: { projects: ShowcaseProject[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {projects.map((p) => (
        <ShowcaseProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
