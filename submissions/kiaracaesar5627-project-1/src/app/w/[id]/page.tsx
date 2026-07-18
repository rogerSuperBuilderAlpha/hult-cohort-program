import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import { createProjectAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import {
  listActivity,
  listProjects,
  listStatuses,
  listTasksForWorkspace,
} from "@/lib/db";
import { projectProgress, readableText, urgency } from "@/lib/labels";
import { canManageProjects } from "@/lib/roles";
import { getShellData } from "@/lib/workspace-server";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function startOfWeek(date: Date): Date {
  const start = new Date(date);
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

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
  const activeProjects = projects.filter((p) => !p.archived);
  const canCreate = canManageProjects(role);
  const myTasks = tasks.filter((task) => task.assignee_id === user.id);
  const myDoneTasks = myTasks.filter(
    (task) => task.status_id && doneIds.has(task.status_id),
  );
  const currentWeekStart = startOfWeek(new Date());
  const weeklyProgress = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(
      currentWeekStart.getTime() - (5 - index) * WEEK_MS,
    );
    const end = new Date(start.getTime() + WEEK_MS);
    return {
      label: start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      count: myDoneTasks.filter((task) => {
        const completedAt = new Date(task.updated_at).getTime();
        return completedAt >= start.getTime() && completedAt < end.getTime();
      }).length,
    };
  });
  const currentWeekCompleted =
    weeklyProgress[weeklyProgress.length - 1]?.count ?? 0;
  const previousWeekCompleted =
    weeklyProgress[weeklyProgress.length - 2]?.count ?? 0;
  const weeklyDifference = currentWeekCompleted - previousWeekCompleted;
  const weeklyMax = Math.max(
    1,
    ...weeklyProgress.map((week) => week.count),
  );
  const myOpenCount = myTasks.length - myDoneTasks.length;

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
          <div className="split">
            <Link className="btn-secondary" href={`/w/${id}/projects`}>
              All projects
            </Link>
            {canCreate ? (
              <Link className="btn" href={`/w/${id}/projects`}>
                New project
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid-4">
          <div className="panel metric">
            <div className="label">Projects</div>
            <div className="value">{activeProjects.length}</div>
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
            <div className="label">Team focus</div>
            <div className="value">{myOpen.length}</div>
            <div className="muted">Assigned to you</div>
          </div>
        </div>

        <section className="panel">
          <div className="section-head" style={{ marginBottom: "0.75rem" }}>
            <h1 style={{ fontSize: "1.25rem" }}>Projects</h1>
            <Link href={`/w/${id}/projects`} className="muted">
              View all →
            </Link>
          </div>
          {activeProjects.length === 0 ? (
            <div className="empty">
              <p style={{ margin: "0 0 0.75rem" }}>
                No projects yet. Create one to start tracking work.
              </p>
              {canCreate ? (
                <form className="form" action={createProjectAction} style={{ maxWidth: 420, margin: "0 auto", textAlign: "left" }}>
                  <input type="hidden" name="workspaceId" value={id} />
                  <label>
                    Project name
                    <input name="name" required placeholder="e.g. Website Revamp" />
                  </label>
                  <label>
                    Description
                    <input name="description" placeholder="What is this project about?" />
                  </label>
                  <SubmitButton>Create first project</SubmitButton>
                </form>
              ) : (
                <p className="muted">Ask an admin to create a project for you.</p>
              )}
            </div>
          ) : (
            <div className="project-list">
              {activeProjects.map((p) => {
                const projectTasks = p.tasks ?? [];
                const progress = projectProgress(projectTasks, doneIds);
                const open = projectTasks.filter(
                  (t) => !t.status_id || !doneIds.has(t.status_id),
                ).length;
                return (
                  <Link
                    key={p.id}
                    href={`/w/${id}/projects/${p.id}`}
                    className="project-card"
                  >
                    <div className="row-split">
                      <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          className="dot"
                          style={{ background: p.color }}
                          aria-hidden
                        />
                        {p.name}
                      </strong>
                      <span className="soon-tag">{progress}%</span>
                    </div>
                    {p.description ? (
                      <div className="task-meta" style={{ marginTop: 6 }}>
                        {p.description}
                      </div>
                    ) : null}
                    <div className="progress-track" style={{ marginTop: 10 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${progress}%`,
                          background: p.color,
                        }}
                      />
                    </div>
                    <div className="task-meta" style={{ marginTop: 8 }}>
                      {projectTasks.length} tasks · {open} open
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

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
              <div className="empty" style={{ padding: "1.25rem" }}>
                Nothing assigned to you right now.
                {openTasks.length > 0 ? (
                  <p className="muted" style={{ margin: "0.5rem 0 0" }}>
                    {openTasks.length} open tasks in this workspace — open a
                    project to pick one up.
                  </p>
                ) : null}
              </div>
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

        <section className="panel weekly-analytics">
          <div className="section-head">
            <div>
              <p className="brand-sub">Analytics</p>
              <h1 style={{ fontSize: "1.25rem" }}>Your weekly progress</h1>
              <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                Completed tasks assigned to you, grouped by week.
              </p>
            </div>
            <div className="weekly-summary" aria-label="Current weekly summary">
              <div>
                <strong>{currentWeekCompleted}</strong>
                <span>Completed this week</span>
              </div>
              <div>
                <strong>
                  {weeklyDifference > 0 ? "+" : ""}
                  {weeklyDifference}
                </strong>
                <span>Compared with last week</span>
              </div>
              <div>
                <strong>{myOpenCount}</strong>
                <span>Assigned tasks remaining</span>
              </div>
            </div>
          </div>

          <div
            className="weekly-chart"
            role="img"
            aria-label={`Weekly completed tasks: ${weeklyProgress
              .map((week) => `${week.label}, ${week.count}`)
              .join("; ")}`}
          >
            {weeklyProgress.map((week, index) => (
              <div className="weekly-column" key={week.label}>
                <span className="weekly-value">{week.count}</span>
                <div className="weekly-track">
                  <div
                    className={`weekly-bar${
                      index === weeklyProgress.length - 1 ? " current" : ""
                    }`}
                    style={{
                      height:
                        week.count === 0
                          ? "4px"
                          : `${Math.max(12, (week.count / weeklyMax) * 100)}%`,
                    }}
                  />
                </div>
                <span className="weekly-label">{week.label}</span>
              </div>
            ))}
          </div>
        </section>

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
