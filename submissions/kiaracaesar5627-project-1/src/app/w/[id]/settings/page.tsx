import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import {
  createAutomationAction,
  createCustomFieldAction,
  createLabelAction,
  createStatusAction,
  deleteAutomationAction,
  deleteCustomFieldAction,
  deleteLabelAction,
  deleteStatusAction,
  toggleAutomationAction,
  updateStatusAction,
  updateWorkspaceAppearanceAction,
  updateWorkspaceFeaturesAction,
} from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import {
  listAutomations,
  listCustomFields,
  listLabels,
  listStatuses,
} from "@/lib/db";
import { readableText } from "@/lib/labels";
import { canManageWorkspace } from "@/lib/roles";
import type { WorkspaceFeatures } from "@/lib/types";
import { getShellData } from "@/lib/workspace-server";

const CORE_FEATURES: { key: keyof WorkspaceFeatures; label: string; desc: string }[] = [
  { key: "kanban", label: "Board view", desc: "Drag-and-drop Kanban columns" },
  { key: "table", label: "Table view", desc: "Spreadsheet-style task grid" },
  { key: "calendar", label: "Calendar view", desc: "Tasks plotted by due date" },
  { key: "labels", label: "Labels", desc: "Color-coded tags on tasks" },
  { key: "customFields", label: "Custom fields", desc: "Your own task attributes" },
  { key: "comments", label: "Comments", desc: "Discussion threads on tasks" },
  { key: "activity", label: "Activity feed", desc: "Workspace change history" },
  { key: "automations", label: "Automations", desc: "Rules that react to status changes" },
  { key: "notifications", label: "Notifications", desc: "In-app alerts" },
];

const SOON_FEATURES: { key: keyof WorkspaceFeatures; label: string; desc: string }[] = [
  { key: "files", label: "File sharing", desc: "Attachments & storage" },
  { key: "integrations", label: "Integrations", desc: "Slack, GitHub, Google Calendar…" },
  { key: "ai", label: "AI assist", desc: "Prompt → task breakdown" },
  { key: "gantt", label: "Timeline / Gantt", desc: "Dependencies & scheduling" },
];

const ACTION_LABELS: Record<string, string> = {
  notify_owner: "Notify task creator",
  notify_assignee: "Notify assignee",
};

export default async function SettingsPage({
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

  if (!canManageWorkspace(role)) {
    return (
      <AppShell
        user={user}
        workspace={workspace}
        role={role}
        workspaces={workspaces}
        unread={unread}
        active="settings"
      >
        <div className="empty">
          Settings are managed by Admins and the Owner. Your role: {role}.
        </div>
      </AppShell>
    );
  }

  const [statuses, labels, fields, automations] = await Promise.all([
    listStatuses(id),
    listLabels(id),
    listCustomFields(id),
    listAutomations(id),
  ]);

  return (
    <AppShell
      user={user}
      workspace={workspace}
      role={role}
      workspaces={workspaces}
      unread={unread}
      active="settings"
    >
      <div className="stack">
        <div>
          <p className="brand-sub">Workspace settings</p>
          <h1>Make it yours</h1>
          <p className="lead" style={{ marginBottom: 0 }}>
            Everything below shapes how this workspace behaves. Turn features on
            and off, and define your own workflow.
          </p>
        </div>

        <div className="grid-2">
          <section className="panel">
            <h1 style={{ fontSize: "1.2rem" }}>Appearance</h1>
            <form className="form" action={updateWorkspaceAppearanceAction}>
              <input type="hidden" name="workspaceId" value={id} />
              <label>
                Workspace name
                <input name="name" required defaultValue={workspace.name} />
              </label>
              <label>
                Accent color
                <input type="color" name="accent" defaultValue={workspace.accent_color} />
              </label>
              <SubmitButton>Save appearance</SubmitButton>
            </form>
          </section>

          <section className="panel">
            <h1 style={{ fontSize: "1.2rem" }}>Features</h1>
            <p className="muted" style={{ marginBottom: "0.5rem" }}>
              Enable only what your team needs.
            </p>
            <form action={updateWorkspaceFeaturesAction}>
              <input type="hidden" name="workspaceId" value={id} />
              {CORE_FEATURES.map((feat) => (
                <div className="toggle-row" key={feat.key}>
                  <div>
                    <strong>{feat.label}</strong>
                    <div className="muted">{feat.desc}</div>
                  </div>
                  <span className="switch">
                    <input
                      type="checkbox"
                      name={`feature_${feat.key}`}
                      defaultChecked={workspace.features[feat.key]}
                    />
                    <span className="track" />
                  </span>
                </div>
              ))}
              <div style={{ marginTop: "0.9rem" }}>
                <SubmitButton>Save features</SubmitButton>
              </div>
            </form>
          </section>
        </div>

        <section className="panel">
          <h1 style={{ fontSize: "1.2rem" }}>Statuses</h1>
          <p className="muted">Define your own workflow stages — not just To-do / Done.</p>
          <div className="task-list" style={{ margin: "0.75rem 0" }}>
            {statuses.map((s) => (
              <form key={s.id} action={updateStatusAction} className="card-row">
                <input type="hidden" name="workspaceId" value={id} />
                <input type="hidden" name="statusId" value={s.id} />
                <div className="split" style={{ alignItems: "flex-end" }}>
                  <label style={{ flex: 1 }}>
                    Name
                    <input name="name" defaultValue={s.name} required />
                  </label>
                  <label>
                    Color
                    <input type="color" name="color" defaultValue={s.color} />
                  </label>
                  <label className="split" style={{ fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      name="isDone"
                      defaultChecked={s.is_done}
                      style={{ width: "auto" }}
                    />
                    Completed stage
                  </label>
                  <SubmitButton className="ghost-btn">Save</SubmitButton>
                </div>
              </form>
            ))}
          </div>
          <div className="split">
            {statuses.map((s) => (
              <form key={s.id} action={deleteStatusAction}>
                <input type="hidden" name="workspaceId" value={id} />
                <input type="hidden" name="statusId" value={s.id} />
                <SubmitButton className="danger-btn">Delete “{s.name}”</SubmitButton>
              </form>
            ))}
          </div>
          <form className="split" action={createStatusAction} style={{ marginTop: "1rem", alignItems: "flex-end" }}>
            <input type="hidden" name="workspaceId" value={id} />
            <label style={{ flex: 1 }}>
              New status
              <input name="name" required placeholder="e.g. Blocked" />
            </label>
            <label>
              Color
              <input type="color" name="color" defaultValue="#64748b" />
            </label>
            <label className="split" style={{ fontWeight: 500 }}>
              <input type="checkbox" name="isDone" style={{ width: "auto" }} />
              Completed
            </label>
            <SubmitButton>Add status</SubmitButton>
          </form>
        </section>

        <div className="grid-2">
          <section className="panel">
            <h1 style={{ fontSize: "1.2rem" }}>Labels</h1>
            <div className="chip-row" style={{ margin: "0.6rem 0" }}>
              {labels.length === 0 ? (
                <span className="muted">No labels yet.</span>
              ) : (
                labels.map((l) => (
                  <form key={l.id} action={deleteLabelAction}>
                    <input type="hidden" name="workspaceId" value={id} />
                    <input type="hidden" name="labelId" value={l.id} />
                    <button
                      type="submit"
                      className="badge"
                      style={{
                        background: l.color,
                        color: readableText(l.color),
                        border: "none",
                        cursor: "pointer",
                      }}
                      title="Delete label"
                    >
                      {l.name} ✕
                    </button>
                  </form>
                ))
              )}
            </div>
            <form className="split" action={createLabelAction} style={{ alignItems: "flex-end" }}>
              <input type="hidden" name="workspaceId" value={id} />
              <label style={{ flex: 1 }}>
                New label
                <input name="name" required placeholder="e.g. Design" />
              </label>
              <label>
                Color
                <input type="color" name="color" defaultValue="#2563eb" />
              </label>
              <SubmitButton>Add</SubmitButton>
            </form>
          </section>

          <section className="panel">
            <h1 style={{ fontSize: "1.2rem" }}>Custom fields</h1>
            <div className="task-list" style={{ margin: "0.6rem 0" }}>
              {fields.length === 0 ? (
                <span className="muted">No custom fields yet.</span>
              ) : (
                fields.map((field) => (
                  <div key={field.id} className="row-split">
                    <span>
                      <strong>{field.name}</strong>{" "}
                      <span className="soon-tag">{field.type}</span>
                      {field.options.length ? (
                        <span className="muted"> · {field.options.join(", ")}</span>
                      ) : null}
                    </span>
                    <form action={deleteCustomFieldAction}>
                      <input type="hidden" name="workspaceId" value={id} />
                      <input type="hidden" name="fieldId" value={field.id} />
                      <SubmitButton className="danger-btn">Delete</SubmitButton>
                    </form>
                  </div>
                ))
              )}
            </div>
            <form className="form" action={createCustomFieldAction}>
              <input type="hidden" name="workspaceId" value={id} />
              <div className="grid-2">
                <label>
                  Field name
                  <input name="name" required placeholder="Story points" />
                </label>
                <label>
                  Type
                  <select name="type" defaultValue="text">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Dropdown</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </label>
              </div>
              <label>
                Dropdown options (comma-separated)
                <input name="options" placeholder="Low, Medium, High" />
              </label>
              <SubmitButton>Add field</SubmitButton>
            </form>
          </section>
        </div>

        <section className="panel">
          <h1 style={{ fontSize: "1.2rem" }}>Automations</h1>
          <p className="muted">
            When a task enters a status, automatically notify someone.
          </p>
          <div className="task-list" style={{ margin: "0.75rem 0" }}>
            {automations.length === 0 ? (
              <span className="muted">No automation rules yet.</span>
            ) : (
              automations.map((rule) => {
                const trigger = statuses.find((s) => s.id === rule.trigger_status_id);
                return (
                  <div key={rule.id} className="row-split card-row">
                    <span>
                      <strong>{rule.name}</strong>
                      <div className="muted">
                        When status → {trigger?.name ?? "?"} ·{" "}
                        {ACTION_LABELS[rule.action] ?? rule.action}
                        {rule.enabled ? "" : " · (disabled)"}
                      </div>
                    </span>
                    <div className="split">
                      <form action={toggleAutomationAction}>
                        <input type="hidden" name="workspaceId" value={id} />
                        <input type="hidden" name="ruleId" value={rule.id} />
                        <input
                          type="hidden"
                          name="enabled"
                          value={rule.enabled ? "false" : "true"}
                        />
                        <SubmitButton className="ghost-btn">
                          {rule.enabled ? "Disable" : "Enable"}
                        </SubmitButton>
                      </form>
                      <form action={deleteAutomationAction}>
                        <input type="hidden" name="workspaceId" value={id} />
                        <input type="hidden" name="ruleId" value={rule.id} />
                        <SubmitButton className="danger-btn">Delete</SubmitButton>
                      </form>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form className="split" action={createAutomationAction} style={{ alignItems: "flex-end" }}>
            <input type="hidden" name="workspaceId" value={id} />
            <label style={{ flex: 1 }}>
              Rule name
              <input name="name" required placeholder="Ping owner when done" />
            </label>
            <label>
              When status is
              <select name="triggerStatusId" required defaultValue="">
                <option value="" disabled>
                  Select…
                </option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Action
              <select name="action" defaultValue="notify_owner">
                <option value="notify_owner">Notify task creator</option>
                <option value="notify_assignee">Notify assignee</option>
              </select>
            </label>
            <SubmitButton>Add rule</SubmitButton>
          </form>
        </section>

        <section className="panel soon">
          <div className="row-split">
            <h1 style={{ fontSize: "1.2rem" }}>Coming soon</h1>
            <span className="soon-tag">Roadmap</span>
          </div>
          <p className="muted">
            These integrations are stubbed and not yet wired to production
            services.
          </p>
          <div className="grid-4" style={{ marginTop: "0.75rem" }}>
            {SOON_FEATURES.map((s) => (
              <div className="feature-chip" key={s.key}>
                <strong>{s.label}</strong>
                <span>{s.desc}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
