import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import { archiveProjectAction, createProjectAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { listProjects } from "@/lib/db";
import { projectProgress } from "@/lib/labels";
import type { TaskStatus } from "@/lib/types";

type ProjectRow = {
  id: string;
  name: string;
  archived: boolean;
  owner?: { username: string };
  tasks?: { status: TaskStatus }[];
};

export default async function ProjectsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const projects = (await listProjects({
    includeOwner: true,
    includeTasks: true,
  })) as ProjectRow[];

  return (
    <AppShell user={user}>
      <div className="grid-2">
        <section className="panel stack">
          <div>
            <p className="brand-sub">Portfolio</p>
            <h1>Projects</h1>
            <p className="lead">
              Create, edit via project pages, and archive when a cycle closes.
            </p>
          </div>
          <div className="project-list">
            {projects.map((project) => {
              const pct = projectProgress(project.tasks ?? []);
              return (
                <div key={project.id} className="project-row">
                  <div className="split" style={{ justifyContent: "space-between" }}>
                    <Link href={`/projects/${project.id}`}>
                      <strong>
                        {project.name}
                        {project.archived ? " (archived)" : ""}
                      </strong>
                    </Link>
                    <span className="muted">{pct}%</span>
                  </div>
                  <div className="muted">
                    @{project.owner?.username ?? "unknown"} ·{" "}
                    {(project.tasks ?? []).length} tasks
                  </div>
                  {!project.archived ? (
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  ) : null}
                  <form action={archiveProjectAction} className="inline-form">
                    <input type="hidden" name="id" value={project.id} />
                    <input
                      type="hidden"
                      name="archived"
                      value={project.archived ? "false" : "true"}
                    />
                    <SubmitButton className="ghost-btn">
                      {project.archived ? "Restore" : "Archive"}
                    </SubmitButton>
                  </form>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <h1 style={{ fontSize: "1.45rem" }}>Create project</h1>
          <p className="lead">Every builder should have at least one active project.</p>
          <form className="form" action={createProjectAction}>
            <label>
              Name
              <input name="name" required placeholder="Week 2 · Comms platform" />
            </label>
            <label>
              Description
              <textarea
                name="description"
                placeholder="What this project owns for the cohort"
              />
            </label>
            <SubmitButton>Create project</SubmitButton>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
