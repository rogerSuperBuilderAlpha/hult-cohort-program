import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import {
  createTaskAction,
  setTaskStatusAction,
  updateProjectAction,
} from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { getProjectById, listUsersPublic } from "@/lib/db";
import { projectProgress, statusLabel, urgency } from "@/lib/labels";
import type { TaskStatus } from "@/lib/types";

type ProjectDetail = {
  id: string;
  name: string;
  description: string;
  archived: boolean;
  owner?: { username: string };
  tasks?: Array<{
    id: string;
    title: string;
    status: TaskStatus;
    due_date: string | null;
    assignee?: { username: string } | null;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const [projectRaw, users] = await Promise.all([
    getProjectById(id),
    listUsersPublic(),
  ]);

  if (!projectRaw) notFound();
  const project = projectRaw as ProjectDetail;
  const tasks = [...(project.tasks ?? [])].sort((a, b) =>
    a.status.localeCompare(b.status),
  );
  const pct = projectProgress(tasks);

  return (
    <AppShell user={user}>
      <div className="stack">
        <div className="section-head">
          <div>
            <p className="brand-sub">
              <Link href="/projects">Projects</Link> / {project.name}
            </p>
            <h1>{project.name}</h1>
            <p className="lead" style={{ marginBottom: 0 }}>
              {project.description || "No description yet."} Owner @
              {project.owner?.username ?? "unknown"}
              {project.archived ? " · archived" : ""}
            </p>
          </div>
          <div className="muted">{pct}% complete</div>
        </div>

        <div className="progress-track" style={{ height: "0.65rem" }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="grid-2">
          <section className="panel">
            <h1 style={{ fontSize: "1.35rem" }}>Tasks</h1>
            <div className="task-list" style={{ marginTop: "0.75rem" }}>
              {tasks.length === 0 ? (
                <p className="muted">No tasks yet — add the first one.</p>
              ) : (
                tasks.map((task) => {
                  const due = urgency(task.due_date);
                  return (
                    <div key={task.id} className="task-row">
                      <div>
                        <strong>{task.title}</strong>
                        <div className="task-meta">
                          {statusLabel(task.status)}
                          {task.assignee
                            ? ` · @${task.assignee.username}`
                            : " · unassigned"}
                          {due ? ` · ${due.label}` : ""}
                        </div>
                      </div>
                      <div className="split">
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
                        {task.status !== "DONE" ? (
                          <form action={setTaskStatusAction}>
                            <input type="hidden" name="id" value={task.id} />
                            <input
                              type="hidden"
                              name="status"
                              value={
                                task.status === "TODO" ? "IN_PROGRESS" : "DONE"
                              }
                            />
                            <SubmitButton className="ghost-btn">
                              {task.status === "TODO" ? "Start" : "Done"}
                            </SubmitButton>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <div className="stack">
            <section className="panel">
              <h1 style={{ fontSize: "1.35rem" }}>Add task</h1>
              <form className="form" action={createTaskAction}>
                <input type="hidden" name="projectId" value={project.id} />
                <label>
                  Title
                  <input name="title" required />
                </label>
                <label>
                  Description
                  <textarea name="description" />
                </label>
                <label>
                  Assignee
                  <select name="assigneeId" defaultValue="">
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        @{u.username}
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
                <SubmitButton>Add task</SubmitButton>
              </form>
            </section>

            <section className="panel">
              <h1 style={{ fontSize: "1.35rem" }}>Edit project</h1>
              <form className="form" action={updateProjectAction}>
                <input type="hidden" name="id" value={project.id} />
                <label>
                  Name
                  <input name="name" required defaultValue={project.name} />
                </label>
                <label>
                  Description
                  <textarea name="description" defaultValue={project.description} />
                </label>
                <SubmitButton>Save</SubmitButton>
              </form>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
