"use client";

import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import type { ProjectLink } from "@/lib/types";

export function EvidenceCard({
  project,
  index = 0,
}: {
  project: ProjectLink;
  index?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  function onMove(e: PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty(
      "--gx",
      `${((e.clientX - rect.left) / rect.width) * 100}%`,
    );
    el.style.setProperty(
      "--gy",
      `${((e.clientY - rect.top) / rect.height) * 100}%`,
    );
  }

  return (
    <article
      ref={ref}
      className="evidence-card"
      style={{ animationDelay: `${index * 80}ms` }}
      onPointerMove={onMove}
    >
      <div className="evidence-shine" aria-hidden />
      <p className="font-mono text-xs uppercase tracking-wider text-[var(--signal)]">
        {project.slug}
      </p>
      <p className="mt-2 font-display text-xl">{project.label}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {project.repoUrl ? (
          <a
            href={project.repoUrl}
            className="btn btn-ghost text-sm"
            target="_blank"
            rel="noreferrer"
          >
            Repository
          </a>
        ) : null}
        {project.deployUrl ? (
          <a
            href={project.deployUrl}
            className="btn btn-primary text-sm"
            target="_blank"
            rel="noreferrer"
          >
            Live deploy
          </a>
        ) : (
          <span className="font-mono text-xs text-[var(--fog)]/60 self-center">
            Deploy pending
          </span>
        )}
      </div>
    </article>
  );
}

export function ProfileSkillCloud({
  skills,
  handle,
}: {
  skills: string[];
  handle: string;
}) {
  return (
    <div className="skill-cloud">
      {skills.map((skill, i) => (
        <Link
          key={skill}
          href={`/people?skill=${encodeURIComponent(skill)}`}
          className="skill-orb"
          style={{ animationDelay: `${i * 90}ms` }}
          title={`Browse more with ${skill}`}
        >
          {skill}
        </Link>
      ))}
      <a
        href={`https://github.com/${handle}`}
        className="skill-orb skill-orb-accent"
        target="_blank"
        rel="noreferrer"
      >
        GitHub ↗
      </a>
    </div>
  );
}
