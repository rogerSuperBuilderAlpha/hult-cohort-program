import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import { setTaskStatusAction, updateTaskAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { statusLabel, urgency } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{
    project?: string;
    status?: string;
    assignee?: string;
  }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const statusFilter =
    sp.status && ["TODO", "IN_PROGRESS", "DONE"].includes(sp.status)
      ? (sp.status as TaskStatus)
      : undefined;

  const [tasks, projects, users] = await Promise.all([
    prisma.task.findMany({
      where: {
        ...(sp.project ? { projectId: sp.project } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(sp.assignee ? { assigneeId: sp.assignee } : {}),
      },
      include: {
        project: true,
        assignee: true,
      },
      orderBy: [{ updatedAt: "desc" }],
    }),
    prisma.project.findMany({
      where: { archived: false },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      orderBy: { username: "asc" },
      select: { id: true, username: true, name: true },
    }),
  ]);

  return (
    <AppShell user={user}>
      <div className="stack">
        <div>
          <p className="brand-sub">Work queue</p>
          <h1>Tasks</h1>
          <p className="lead">
            Filter by project, status, or assignee — then push status forward.
          </p>
        </div>

        <form className="filters panel">
          <label>
            Project
            <select name="project" defaultValue={sp.project ?? ""}>
              <option value="">All</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select name="status" defaultValue={sp.status ?? ""}>
              <option value="">All</option>
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DONE">Done</option>
            </select>
          </label>
          <label>
            Assignee
            <select name="assignee" defaultValue={sp.assignee ?? ""}>
              <option value="">All</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  @{u.username}
                </option>
              ))}
            </select>
          </label>
          <div style={{ alignSelf: "end" }}>
            <SubmitButton>Apply filters</SubmitButton>
          </div>
        </form>

        <div className="task-list">
          {tasks.length === 0 ? (
            <div className="panel muted">No tasks match these filters.</div>
          ) : (
            tasks.map((task) => {
              const due = urgency(task.dueDate);
              return (
                <div key={task.id} className="panel stack">
                  <div className="split" style={{ justifyContent: "space-between" }}>
                    <div>
                      <strong>{task.title}</strong>
                      <div className="task-meta">
                        {task.project.name}
                        {task.assignee ? ` · @${task.assignee.username}` : " · unassigned"}
                        {due ? ` · ${due.label}` : ""}
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        task.status === "DONE"
                          ? "done"
                          : task.status === "IN_PROGRESS"
                            ? "progress"
                            : "todo"
                      }`}
                    >
                      {statusLabel(task.status)}
                    </span>
                  </div>
                  {task.description ? <p className="muted">{task.description}</p> : null}
                  <div className="split">
                    <form action={setTaskStatusAction} className="inline-form">
                      <input type="hidden" name="id" value={task.id} />
                      <select name="status" defaultValue={task.status}>
                        <option value="TODO">To do</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="DONE">Done</option>
                      </select>
                      <SubmitButton className="ghost-btn">Set status</SubmitButton>
                    </form>
                    <form action={updateTaskAction} className="inline-form">
                      <input type="hidden" name="id" value={task.id} />
                      <input type="hidden" name="title" value={task.title} />
                      <input
                        type="hidden"
                        name="description"
                        value={task.description}
                      />
                      <input
                        type="hidden"
                        name="status"
                        value={task.status}
                      />
                      <input
                        type="hidden"
                        name="dueDate"
                        value={
                          task.dueDate
                            ? task.dueDate.toISOString().slice(0, 10)
                            : ""
                        }
                      />
                      <select
                        name="assigneeId"
                        defaultValue={task.assigneeId ?? ""}
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            @{u.username}
                          </option>
                        ))}
                      </select>
                      <SubmitButton className="ghost-btn">Reassign</SubmitButton>
                    </form>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
