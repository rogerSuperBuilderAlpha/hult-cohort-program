import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getSessionUser } from "@/lib/auth";
import {
  listActivity,
  listProjects,
  listStatuses,
  listTasksForWorkspace,
} from "@/lib/db";
import { readableText, urgency } from "@/lib/labels";
import { getShellData } from "@/lib/workspace-server";

export default async function WorkspaceDashboard({
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

  const [statuses, projects, tasks, activity] = await Promise.all([
    listStatuses(id),
    listProjects({ workspaceId: id, includeTasks: true }),
    listTasksForWorkspace(id),
    workspace.features.activity ? listActivity(id, 12) : Promise.resolve([]),
  ]);

  const doneIds = new Set(statuses.filter((s) => s.is_done).map((s) => s.id));
  const openTasks = tasks.filter((t) => !t.status_id || !doneIds.has(t.status_id));
  const doneTasks = tasks.filter((t) => t.status_id && doneIds.has(t.status_id));
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const doneThisWeek = doneTasks.filter(
    (t) => new Date(t.updated_at).getTime() >= weekAgo,
  ).length;

  const myOpen = openTasks
    .filter((t) => t.assignee_id === user.id)
    .slice(0, 6);

  const byStatus = statuses.map((s) => ({
    status: s,
    count: tasks.filter((t) => t.status_id === s.id).length,
  }));
  const maxCount = Math.max(1, ...byStatus.map((b) => b.count));

  return (
    <AppShell
      user={user}
      workspace={workspace}
      role={role}
      workspaces={workspaces}
      unread={unread}
      active="dashboard"
    >
      <div className="stack">
        <div className="section-head">
          <div>
            <p className="brand-sub">{workspace.name}</p>
            <h1>Dashboard</h1>
            <p className="lead" style={{ marginBottom: 0 }}>
              A live read on everything moving through this workspace.
            </p>
          </div>
          <Link className="btn" href={`/w/${id}/projects`}>
            Projects
          </Link>
        </div>

        <div className="grid-4">
          <div className="panel metric">
            <div className="label">Projects</div>
            <div className="value">{projects.length}</div>
            <div className="muted">Active in workspace</div>
          </div>
          <div className="panel metric">
            <div className="label">Open tasks</div>
            <div className="value">{openTasks.length}</div>
            <div className="muted">Not yet completed</div>
          </div>
          <div className="panel metric">
            <div className="label">Completed / wk</div>
            <div className="value">{doneThisWeek}</div>
            <div className="muted">Last 7 days</div>
          </div>
          <div className="panel metric">
            <div className="label">Total tasks</div>
            <div className="value">{tasks.length}</div>
            <div className="muted">Across all projects</div>
          </div>
        </div>

        <div className="grid-2">
          <section className="panel">
            <h1 style={{ fontSize: "1.25rem" }}>Tasks by status</h1>
            <div className="stack" style={{ marginTop: "0.75rem", gap: "0.6rem" }}>
              {byStatus.length === 0 ? (
                <p className="muted">Define statuses in Settings.</p>
              ) : (
                byStatus.map(({ status, count }) => (
                  <div key={status.id}>
                    <div className="row-split" style={{ marginBottom: 4 }}>
                      <span className="split">
                        <span
                          className="dot"
                          style={{ background: status.color }}
                          aria-hidden
                        />
                        {status.name}
                        {status.is_done ? (
                          <span className="soon-tag">done</span>
                        ) : null}
                      </span>
                      <span className="muted">{count}</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(count / maxCount) * 100}%`,
                          background: status.color,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="panel">
            <div className="section-head" style={{ marginBottom: "0.75rem" }}>
              <h1 style={{ fontSize: "1.25rem" }}>My open tasks</h1>
            </div>
            {myOpen.length === 0 ? (
              <p className="muted">Nothing assigned to you right now.</p>
            ) : (
              <div className="task-list">
                {myOpen.map((t) => {
                  const due = urgency(t.due_date);
                  return (
                    <Link
                      key={t.id}
                      href={`/w/${id}/tasks/${t.id}`}
                      className="card-row linky"
                    >
                      <div className="row-split">
                        <strong>{t.title}</strong>
                        {due?.kind === "overdue" ? (
                          <span className="badge overdue">Overdue</span>
                        ) : due?.kind === "soon" ? (
                          <span className="badge soon">Due soon</span>
                        ) : null}
                      </div>
                      <div className="task-meta">
                        {t.project?.name ?? "Project"}
                        {due ? ` · ${due.label}` : ""}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {workspace.features.activity ? (
          <section className="panel">
            <h1 style={{ fontSize: "1.25rem" }}>Recent activity</h1>
            <div className="task-list" style={{ marginTop: "0.75rem" }}>
              {activity.length === 0 ? (
                <p className="muted">No activity yet.</p>
              ) : (
                activity.map((a) => (
                  <div key={a.id} className="row-split">
                    <span>
                      <strong>@{a.user?.username ?? "someone"}</strong> {a.verb}
                      {a.detail ? (
                        <span className="muted"> — {a.detail}</span>
                      ) : null}
                    </span>
                    <span className="muted">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : null}

        <div className="chip-row">
          <span className="pill">
            <span
              className="dot"
              style={{ background: workspace.accent_color }}
              aria-hidden
            />
            Accent
          </span>
          <span
            className="pill"
            style={{
              background: workspace.accent_color,
              color: readableText(workspace.accent_color),
              border: "none",
            }}
          >
            {workspace.name}
          </span>
        </div>
      </div>
    </AppShell>
  );
}
