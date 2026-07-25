import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import {
  addCommentAction,
  setTaskFieldAction,
  setTaskLabelsAction,
  updateTaskAction,
} from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import {
  getTaskById,
  getTaskFieldValues,
  listComments,
  listCustomFields,
  listLabels,
  listMembers,
  listStatuses,
  listTaskLabels,
} from "@/lib/db";
import { readableText } from "@/lib/labels";
import { canEditTasks } from "@/lib/roles";
import { getShellData } from "@/lib/workspace-server";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await params;
  const shell = await getShellData(id);
  if (!shell) {
    const user = await getSessionUser();
    redirect(user ? "/workspaces" : "/login");
  }
  const { user, workspace, role, workspaces, unread } = shell;
  const f = workspace.features;

  const task = await getTaskById(taskId);
  if (!task || task.project?.workspace_id !== id) notFound();

  const [statuses, labels, taskLabels, fields, fieldValues, members, comments] =
    await Promise.all([
      listStatuses(id),
      f.labels ? listLabels(id) : Promise.resolve([]),
      f.labels ? listTaskLabels(taskId) : Promise.resolve([]),
      f.customFields ? listCustomFields(id) : Promise.resolve([]),
      f.customFields
        ? getTaskFieldValues(taskId)
        : Promise.resolve<Record<string, string>>({}),
      listMembers(id),
      f.comments ? listComments(taskId) : Promise.resolve([]),
    ]);

  const selectedLabelIds = new Set(taskLabels.map((l) => l.id));
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
        <div>
          <p className="brand-sub">
            <Link href={`/w/${id}/projects/${task.project_id}`}>
              {task.project?.name ?? "Project"}
            </Link>{" "}
            / Task
          </p>
          <h1>{task.title}</h1>
        </div>

        <div className="grid-2">
          <div className="stack">
            <section className="panel">
              <h1 style={{ fontSize: "1.2rem" }}>Details</h1>
              {canEdit ? (
                <form className="form" action={updateTaskAction}>
                  <input type="hidden" name="taskId" value={taskId} />
                  <label>
                    Title
                    <input name="title" required defaultValue={task.title} />
                  </label>
                  <label>
                    Description
                    <textarea name="description" defaultValue={task.description} />
                  </label>
                  <div className="grid-2">
                    <label>
                      Status
                      <select name="statusId" defaultValue={task.status_id ?? ""}>
                        {statuses.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Assignee
                      <select name="assigneeId" defaultValue={task.assignee_id ?? ""}>
                        <option value="">Unassigned</option>
                        {members.map((m) => (
                          <option key={m.user_id} value={m.user_id}>
                            @{m.user?.username ?? m.user_id}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label>
                    Due date
                    <input
                      name="dueDate"
                      type="date"
                      defaultValue={task.due_date ? task.due_date.slice(0, 10) : ""}
                    />
                  </label>
                  <SubmitButton>Save changes</SubmitButton>
                </form>
              ) : (
                <p className="muted">{task.description || "No description."}</p>
              )}
            </section>

            {f.comments ? (
              <section className="panel">
                <h1 style={{ fontSize: "1.2rem" }}>Comments</h1>
                <div className="task-list" style={{ margin: "0.75rem 0" }}>
                  {comments.length === 0 ? (
                    <p className="muted">No comments yet.</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="card-row">
                        <div className="row-split">
                          <strong>@{c.user?.username ?? "user"}</strong>
                          <span className="muted">
                            {new Date(c.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div>{c.body}</div>
                      </div>
                    ))
                  )}
                </div>
                {canEdit ? (
                  <form className="form" action={addCommentAction}>
                    <input type="hidden" name="taskId" value={taskId} />
                    <label>
                      Add a comment
                      <textarea name="body" required placeholder="Share an update…" />
                    </label>
                    <SubmitButton>Comment</SubmitButton>
                  </form>
                ) : null}
              </section>
            ) : null}
          </div>

          <div className="stack">
            {f.labels ? (
              <section className="panel">
                <h1 style={{ fontSize: "1.2rem" }}>Labels</h1>
                {labels.length === 0 ? (
                  <p className="muted">No labels defined in this workspace.</p>
                ) : canEdit ? (
                  <form className="form" action={setTaskLabelsAction}>
                    <input type="hidden" name="taskId" value={taskId} />
                    <div className="stack" style={{ gap: "0.4rem" }}>
                      {labels.map((l) => (
                        <label
                          key={l.id}
                          className="split"
                          style={{ fontWeight: 500 }}
                        >
                          <input
                            type="checkbox"
                            name="labelId"
                            value={l.id}
                            defaultChecked={selectedLabelIds.has(l.id)}
                            style={{ width: "auto" }}
                          />
                          <span
                            className="badge"
                            style={{ background: l.color, color: readableText(l.color) }}
                          >
                            {l.name}
                          </span>
                        </label>
                      ))}
                    </div>
                    <SubmitButton className="ghost-btn">Save labels</SubmitButton>
                  </form>
                ) : (
                  <div className="chip-row">
                    {taskLabels.map((l) => (
                      <span
                        key={l.id}
                        className="badge"
                        style={{ background: l.color, color: readableText(l.color) }}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            {f.customFields ? (
              <section className="panel">
                <h1 style={{ fontSize: "1.2rem" }}>Custom fields</h1>
                {fields.length === 0 ? (
                  <p className="muted">No custom fields yet. Add some in Settings.</p>
                ) : (
                  <div className="stack" style={{ gap: "0.7rem" }}>
                    {fields.map((field) => {
                      const value = fieldValues[field.id] ?? "";
                      return (
                        <form
                          key={field.id}
                          className="split"
                          action={setTaskFieldAction}
                          style={{ alignItems: "flex-end" }}
                        >
                          <input type="hidden" name="taskId" value={taskId} />
                          <input type="hidden" name="fieldId" value={field.id} />
                          <label style={{ flex: 1 }}>
                            {field.name}
                            {field.type === "select" ? (
                              <select name="value" defaultValue={value} disabled={!canEdit}>
                                <option value="">—</option>
                                {field.options.map((o) => (
                                  <option key={o} value={o}>
                                    {o}
                                  </option>
                                ))}
                              </select>
                            ) : field.type === "checkbox" ? (
                              <select name="value" defaultValue={value} disabled={!canEdit}>
                                <option value="">—</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            ) : (
                              <input
                                name="value"
                                type={
                                  field.type === "number"
                                    ? "number"
                                    : field.type === "date"
                                      ? "date"
                                      : "text"
                                }
                                defaultValue={value}
                                disabled={!canEdit}
                              />
                            )}
                          </label>
                          {canEdit ? (
                            <SubmitButton className="ghost-btn">Set</SubmitButton>
                          ) : null}
                        </form>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
