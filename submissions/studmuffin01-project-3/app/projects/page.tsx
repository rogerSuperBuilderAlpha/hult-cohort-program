import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CohortStatusPanel } from "@/components/CohortStatusPanel";
import { PROJECTS } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Cohort platforms and initiatives — open each project for problem, proof, and deploy.",
};

const statusLabel: Record<string, string> = {
  shipped: "Shipped",
  "in-progress": "In progress",
  planned: "Planned",
};

const statusTone: Record<string, string> = {
  shipped: "text-[var(--ok)]",
  "in-progress": "text-[var(--signal)]",
  planned: "text-[var(--ink-faint)]",
};

export default function ProjectsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8">
        <h1 className="font-[family-name:var(--font-syne)] text-4xl font-bold tracking-tight">
          Projects
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--ink-muted)]">
          Open a project for the full story — problem, solution, proof of work,
          and deployment.
        </p>

        <ul className="mt-10 space-y-3">
          {PROJECTS.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="block border border-[var(--line)] bg-[var(--bg-elevated)] p-5 transition hover:border-[var(--signal)] sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                      {project.phase}
                    </p>
                    <h2 className="mt-1 font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-tight">
                      {project.name}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)]">
                      {project.tagline}
                    </p>
                    <p className="mt-3 font-[family-name:var(--font-jetbrains)] text-[11px] text-[var(--ink-faint)]">
                      @{project.ownerHandle}
                      {project.deployUrl ? " · Deploy live" : ""}
                    </p>
                  </div>
                  <span
                    className={`font-[family-name:var(--font-jetbrains)] text-[10px] font-medium uppercase tracking-[0.12em] ${statusTone[project.status]}`}
                  >
                    {statusLabel[project.status]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <CohortStatusPanel />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
