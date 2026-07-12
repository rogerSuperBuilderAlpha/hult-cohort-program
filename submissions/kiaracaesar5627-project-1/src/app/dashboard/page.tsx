import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getSessionUser } from "@/lib/auth";
import { projectProgress, statusLabel, urgency } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { createTaskAction, setTaskStatusAction } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [projects, myOpenTasks, users, shippedThisWeek] = await Promise.all([
    prisma.project.findMany({
      where: { archived: false },
      include: { tasks: true, owner: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.task.findMany({
      where: {
        assigneeId: user.id,
        status: { not: "DONE" },
      },
      include: { project: true },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
      take: 5,
    }),
    prisma.user.findMany({
      orderBy: { username: "asc" },
      select: { id: true, username: true, name: true },
    }),
    prisma.task.count({
      where: {
        status: "DONE",
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const openCount = await prisma.task.count({ where: { status: { not: "DONE" } } });
  const inFlight = await prisma.task.count({ where: { status: "IN_PROGRESS" } });

  return (
    <AppShell user={user}>
      <div className="stack">
        <div className="section-head">
          <div>
            <p className="brand-sub">Your board</p>
            <h1>Ship what matters next</h1>
            <p className="lead" style={{ marginBottom: 0 }}>
              Progress is visible. Next actions are named. Deadlines pull their weight.
            </p>
          </div>
          <Link className="btn" href="/projects">
            New project
          </Link>
        </div>

        <div className="grid-3">
          <div className="panel metric">
            <div className="label">Open tasks</div>
            <div className="value">{openCount}</div>
            <div className="muted">Across active projects</div>
          </div>
          <div className="panel metric">
            <div className="label">In flight</div>
            <div className="value">{inFlight}</div>
            <div className="muted">Someone is moving them</div>
          </div>
          <div className="panel metric">
            <div className="label">Shipped this week</div>
            <div className="value">{shippedThisWeek}</div>
            <div className="muted">Done-status updates</div>
          </div>
        </div>

        <div className="grid-2">
          <section className="panel">
            <div className="section-head">
              <h1 style={{ fontSize: "1.45rem" }}>Ship next</h1>
              <Link href="/tasks">All tasks</Link>
            </div>
            {myOpenTasks.length === 0 ? (
              <p className="muted">
                Nothing assigned to you. Create a task or claim one from a project.
              </p>
            ) : (
              <div className="task-list">
                {myOpenTasks.map((task) => {
                  const due = urgency(task.dueDate);
                  return (
                    <div key={task.id} className="task-row">
                      <div>
                        <strong>{task.title}</strong>
                        <div className="task-meta">
                          {task.project.name} · {statusLabel(task.status)}
                          {due ? ` · ${due.label}` : ""}
                        </div>
                      </div>
                      <div className="split">
                        {due?.kind === "overdue" ? (
                          <span className="badge overdue">Overdue</span>
                        ) : null}
                        {due?.kind === "soon" ? (
                          <span className="badge soon">Due soon</span>
                        ) : null}
                        <form action={setTaskStatusAction}>
                          <input type="hidden" name="id" value={task.id} />
                          <input type="hidden" name="status" value="DONE" />
                          <SubmitButton className="ghost-btn">Mark done</SubmitButton>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="panel">
            <h1 style={{ fontSize: "1.45rem", marginBottom: "0.75rem" }}>
              Quick assign
            </h1>
            {projects.length === 0 ? (
              <p className="muted">
                Create a project first, then assign work to any cohort member.
              </p>
            ) : (
              <form className="form" action={createTaskAction}>
                <label>
                  Title
                  <input name="title" required placeholder="Merge submission PR" />
                </label>
                <label>
                  Project
                  <select name="projectId" required defaultValue={projects[0]?.id}>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Assignee
                  <select name="assigneeId" defaultValue={user.id}>
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        @{u.username} — {u.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select name="status" defaultValue="TODO">
                    <option value="TODO">To do</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </label>
                <label>
                  Due date
                  <input name="dueDate" type="date" />
                </label>
                <label>
                  Description
                  <textarea name="description" placeholder="Acceptance criteria, links…" />
                </label>
                <SubmitButton>Create task</SubmitButton>
              </form>
            )}
          </section>
        </div>

        <section className="panel">
          <div className="section-head">
            <h1 style={{ fontSize: "1.45rem" }}>Active projects</h1>
            <Link href="/projects">Manage</Link>
          </div>
          <div className="project-list">
            {projects.length === 0 ? (
              <p className="muted">No projects yet. Start one to unlock the board.</p>
            ) : (
              projects.map((project) => {
                const pct = projectProgress(project.tasks);
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="project-row"
                  >
                    <div className="split" style={{ justifyContent: "space-between" }}>
                      <strong>{project.name}</strong>
                      <span className="muted">{pct}% done</span>
                    </div>
                    <div className="muted">
                      Owner @{project.owner.username} · {project.tasks.length} tasks
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
