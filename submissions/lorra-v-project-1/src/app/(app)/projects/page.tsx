import Link from "next/link";
import { archiveProject, updateProject } from "@/app/actions/projects";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { getCurrentProfile, loadCohortData } from "@/lib/data";
import type { Project } from "@/lib/types";
import {
  Field,
  inputClass,
  secondaryButtonClass,
} from "@/components/ui";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const me = await getCurrentProfile();
  const data = await loadCohortData();
  if (!me) return null;

  const taskCountByProject = new Map<string, number>();
  for (const task of data.tasks) {
    if (!task.project_id) continue;
    taskCountByProject.set(
      task.project_id,
      (taskCountByProject.get(task.project_id) ?? 0) + 1,
    );
  }

  const sorted = [...data.projects].sort((a, b) => {
    if (a.status !== b.status) return a.status === "active" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Projects
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Group tasks under a project. Owners can edit and archive their own.
          </p>
        </div>
        <CreateProjectModal />
      </div>

      {error ? (
        <p className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="rounded-lg border border-[var(--success)]/40 bg-[var(--success)]/10 px-3 py-2 text-sm text-[var(--success)]">
          {ok === "created"
            ? "Project created."
            : ok === "updated"
              ? "Project updated."
              : ok === "archived"
                ? "Project archived."
                : "Done."}
        </p>
      ) : null}

      <div className="space-y-4">
        {sorted.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No projects yet.</p>
        ) : (
          sorted.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              ownerName={
                data.profiles.find((p) => p.id === project.owner_id)?.display_name ??
                "Unknown"
              }
              taskCount={taskCountByProject.get(project.id) ?? 0}
              isOwner={project.owner_id === me.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  ownerName,
  taskCount,
  isOwner,
}: {
  project: Project;
  ownerName: string;
  taskCount: number;
  isOwner: boolean;
}) {
  const archived = project.status === "archived";

  return (
    <article
      className={`rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-5 space-y-4 ${
        archived ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="inline-block rounded-lg bg-transparent px-2.5 py-1 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--ink)]">
              {project.name}
            </h2>
            {archived ? (
              <span className="rounded border border-[var(--line)] px-2 py-0.5 text-xs uppercase tracking-wide text-[var(--muted)]">
                Archived
              </span>
            ) : null}
          </div>
          {project.description ? (
            <p className="mt-1 text-sm text-[var(--muted)]">{project.description}</p>
          ) : null}
          <p className="mt-2 text-sm text-[var(--muted)]">
            Owner {ownerName} · {taskCount} task{taskCount === 1 ? "" : "s"} ·{" "}
            {project.status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/tasks?project=${project.id}&assignee=all&status=all`}
            className={secondaryButtonClass}
          >
            View tasks
          </Link>
          {isOwner && !archived ? (
            <form action={archiveProject}>
              <input type="hidden" name="project_id" value={project.id} />
              <button type="submit" className={secondaryButtonClass}>
                Archive
              </button>
            </form>
          ) : null}
        </div>
      </div>

      {isOwner && !archived ? (
        <form
          action={updateProject}
          className="grid gap-3 border-t border-[var(--line)] pt-4 sm:grid-cols-2"
        >
          <input type="hidden" name="project_id" value={project.id} />
          <Field label="Edit name">
            <input
              className={inputClass}
              name="name"
              defaultValue={project.name}
              required
            />
          </Field>
          <Field label="Edit description">
            <input
              className={inputClass}
              name="description"
              defaultValue={project.description ?? ""}
            />
          </Field>
          <div className="sm:col-span-2">
            <button type="submit" className={`${secondaryButtonClass} text-sm`}>
              Save changes
            </button>
          </div>
        </form>
      ) : null}
    </article>
  );
}
