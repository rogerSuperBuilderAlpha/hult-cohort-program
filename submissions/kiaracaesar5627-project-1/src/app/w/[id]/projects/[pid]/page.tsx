import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { KanbanBoard } from "@/components/KanbanBoard";
import { SubmitButton } from "@/components/SubmitButton";
import { createTaskAction, moveTaskAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { getProjectById, listMembers, listStatuses, listTasksForProject } from "@/lib/db";
import { projectProgress, readableText, urgency } from "@/lib/labels";
import { canEditTasks } from "@/lib/roles";
import { getShellData } from "@/lib/workspace-server";

type View = "list" | "board" | "table";

export default async function ProjectBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; pid: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { id, pid } = await params;
  const { view: viewRaw } = await searchParams;
  const shell = await getShellData(id);
  if (!shell) {
    const user = await getSessionUser();
    redirect(user ? "/workspaces" : "/login");
  }
  const { user, workspace, role, workspaces, unread } = shell;
  const f = workspace.features;

  const [project, statuses, tasks, members] = await Promise.all([
    getProjectById(pid),
    listStatuses(id),
    listTasksForProject(pid),
    listMembers(id),
  ]);
  if (!project || project.workspace_id !== id) notFound();

  const view: View =
    viewRaw === "board" && f.kanban
      ? "board"
      : viewRaw === "table" && f.table
        ? "table"
        : "list";

  const doneIds = new Set(statuses.filter((s) => s.is_done).map((s) => s.id));
  const pct = projectProgress(tasks, doneIds);
  const statusById = new Map(statuses.map((s) => [s.id, s]));
  const canEdit = canEditTasks(role);

  return (
    <AppShell
      user={user}
      workspace={workspace}
      role={role}
      workspaces={workspaces}
      unread={unread}
      active="projects"
    >
      <div className="stack">
        <div className="section-head">
          <div>
            <p className="brand-sub">
              <Link href={`/w/${id}/projects`}>Projects</Link> / {project.name}
            </p>
            <h1>{project.name}</h1>
            <p className="lead" style={{ marginBottom: 0 }}>
              {project.description || "No description yet."} · {pct}% done
            </p>
          </div>
          <div className="tabs">
            <Link
              className={view === "list" ? "active" : ""}
              href={`/w/${id}/projects/${pid}?view=list`}
            >
              List
            </Link>
            {f.kanban ? (
              <Link
                className={view === "board" ? "active" : ""}
                href={`/w/${id}/projects/${pid}?view=board`}
              >
                Board
              </Link>
            ) : null}
            {f.table ? (
              <Link
                className={view === "table" ? "active" : ""}
                href={`/w/${id}/projects/${pid}?view=table`}
              >
                Table
              </Link>
            ) : null}
          </div>
        </div>

        <div className="progress-track" style={{ height: "0.6rem" }}>
          <div
            className="progress-fill"
            style={{ width: `${pct}%`, background: project.color }}
          />
        </div>

        {view === "board" ? (
          <KanbanBoard workspaceId={id} statuses={statuses} tasks={tasks} />
        ) : view === "table" ? (
          <div className="table-wrap">
            <table className="grid">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Assignee</th>
                  <th>Due</th>
                  <th>Labels</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="muted">
                      No tasks yet.
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => {
                    const st = t.status_id ? statusById.get(t.status_id) : undefined;
                    const due = urgency(t.due_date);
                    return (
                      <tr key={t.id}>
                        <td>
                          <Link href={`/w/${id}/tasks/${t.id}`} style={{ fontWeight: 600 }}>
                            {t.title}
                          </Link>
                        </td>
                        <td>
                          {st ? (
                            <span className="split">
                              <span
                                className="dot"
                                style={{ background: st.color }}
                                aria-hidden
                              />
                              {st.name}
                            </span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td>{t.assignee ? `@${t.assignee.username}` : "—"}</td>
                        <td>{due ? due.label : "—"}</td>
                        <td>
                          <div className="chip-row">
                            {(t.labels ?? []).map((l) => (
                              <span
                                key={l.id}
                                className="badge"
                                style={{ background: l.color, color: readableText(l.color) }}
                              >
                                {l.name}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="task-list">
            {tasks.length === 0 ? (
              <div className="empty">No tasks yet — add the first one.</div>
            ) : (
              tasks.map((t) => {
                const st = t.status_id ? statusById.get(t.status_id) : undefined;
                const due = urgency(t.due_date);
                return (
                  <div key={t.id} className="card-row">
                    <div className="row-split">
                      <Link
                        href={`/w/${id}/tasks/${t.id}`}
                        style={{ fontWeight: 700 }}
                      >
                        {t.title}
                      </Link>
                      <div className="split">
                        {(t.labels ?? []).map((l) => (
                          <span
                            key={l.id}
                            className="badge"
                            style={{ background: l.color, color: readableText(l.color) }}
                          >
                            {l.name}
                          </span>
                        ))}
                        {due?.kind === "overdue" ? (
                          <span className="badge overdue">Overdue</span>
                        ) : due?.kind === "soon" ? (
                          <span className="badge soon">Due soon</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="row-split">
                      <span className="task-meta">
                        {t.assignee ? `@${t.assignee.username}` : "unassigned"}
                        {due ? ` · ${due.label}` : ""}
                      </span>
                      {canEdit ? (
                        <form action={moveTaskAction} className="split">
                          <input type="hidden" name="taskId" value={t.id} />
                          <input type="hidden" name="position" value="0" />
                          <select
                            name="statusId"
                            defaultValue={t.status_id ?? ""}
                            style={{ width: "auto" }}
                          >
                            {statuses.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          <SubmitButton className="ghost-btn">Set</SubmitButton>
                        </form>
                      ) : st ? (
                        <span className="pill">
                          <span
                            className="dot"
                            style={{ background: st.color }}
                            aria-hidden
                          />
                          {st.name}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {canEdit ? (
          <section className="panel">
            <h1 style={{ fontSize: "1.25rem" }}>Add task</h1>
            <form className="form" action={createTaskAction}>
              <input type="hidden" name="projectId" value={pid} />
              <div className="grid-2">
                <label>
                  Title
                  <input name="title" required placeholder="Design landing hero" />
                </label>
                <label>
                  Status
                  <select name="statusId" defaultValue={statuses[0]?.id ?? ""}>
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid-2">
                <label>
                  Assignee
                  <select name="assigneeId" defaultValue="">
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        @{m.user?.username ?? m.user_id}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Due date
                  <input name="dueDate" type="date" />
                </label>
              </div>
              <label>
                Description
                <textarea name="description" placeholder="Details, acceptance criteria…" />
              </label>
              <SubmitButton>Add task</SubmitButton>
            </form>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
