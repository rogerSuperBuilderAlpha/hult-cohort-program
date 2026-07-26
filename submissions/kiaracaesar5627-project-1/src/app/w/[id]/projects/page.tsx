import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import { archiveProjectAction, createProjectAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { listProjects, listStatuses } from "@/lib/db";
import { projectProgress } from "@/lib/labels";
import { canManageProjects } from "@/lib/roles";
import { getShellData } from "@/lib/workspace-server";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shell = await getShellData(id);
  if (!shell) {
    const user = await getSessionUser();
    redirect(user ? "/workspaces" : "/login");
  }
  const { user, workspace, role, workspaces, unread } = shell;

  const [projects, statuses] = await Promise.all([
    listProjects({ workspaceId: id, includeTasks: true, includeOwner: true }),
    listStatuses(id),
  ]);
  const doneIds = new Set(statuses.filter((s) => s.is_done).map((s) => s.id));
  const canManage = canManageProjects(role);

  return (
    <AppShell
      user={user}
      workspace={workspace}
      role={role}
      workspaces={workspaces}
      unread={unread}
      active="projects"
    >
      <div className="grid-2">
        <section className="stack">
          <div>
            <p className="brand-sub">Portfolio</p>
            <h1>Projects</h1>
            <p className="lead">
              Open any project to work in List, Board, Table, or Calendar view.
            </p>
          </div>
          <div className="project-list">
            {projects.length === 0 ? (
              <div className="empty">No projects yet.</div>
            ) : (
              projects.map((p) => {
                const pct = projectProgress(p.tasks ?? [], doneIds);
                return (
                  <div key={p.id} className="card-row">
                    <div className="row-split">
                      <Link
                        href={`/w/${id}/projects/${p.id}`}
                        className="split"
                        style={{ fontWeight: 700 }}
                      >
                        <span
                          className="dot"
                          style={{ background: p.color, width: 11, height: 11 }}
                          aria-hidden
                        />
                        {p.name}
                        {p.archived ? <span className="soon-tag">archived</span> : null}
                      </Link>
                      {canManage ? (
                        <form action={archiveProjectAction}>
                          <input type="hidden" name="workspaceId" value={id} />
                          <input type="hidden" name="projectId" value={p.id} />
                          <input
                            type="hidden"
                            name="archived"
                            value={p.archived ? "false" : "true"}
                          />
                          <SubmitButton className="ghost-btn">
                            {p.archived ? "Restore" : "Archive"}
                          </SubmitButton>
                        </form>
                      ) : null}
                    </div>
                    <div className="muted">
                      @{p.owner?.username ?? "unknown"} · {(p.tasks ?? []).length} tasks ·{" "}
                      {pct}% done
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, background: p.color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {canManage ? (
          <section className="panel">
            <h1 style={{ fontSize: "1.3rem" }}>Create project</h1>
            <p className="lead">Projects group your tasks and boards.</p>
            <form className="form" action={createProjectAction}>
              <input type="hidden" name="workspaceId" value={id} />
              <label>
                Name
                <input name="name" required placeholder="Website revamp" />
              </label>
              <label>
                Description
                <textarea name="description" placeholder="What this project owns" />
              </label>
              <label>
                Color
                <input type="color" name="color" defaultValue={workspace.accent_color} />
              </label>
              <SubmitButton>Create project</SubmitButton>
            </form>
          </section>
        ) : (
          <section className="panel soon">
            <h1 style={{ fontSize: "1.3rem" }}>Create project</h1>
            <p className="muted">
              Your role ({role.toLowerCase()}) can view projects. Ask a Manager or
              Admin to create new ones.
            </p>
          </section>
        )}
      </div>
    </AppShell>
  );
}
