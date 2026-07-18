import { getSessionUser, requireUser, type SessionUser } from "./auth";
import {
  addMember,
  countUnreadNotifications,
  createLabel,
  createNotification,
  createStatus,
  getMembership,
  getWorkspaceById,
  listAutomations,
  listStatuses,
  listWorkspacesForUser,
} from "./db";
import { atLeast } from "./roles";
import type { Status, Task, Workspace, WorkspaceRole } from "./types";

export type WorkspaceContext = {
  user: SessionUser;
  workspace: Workspace;
  role: WorkspaceRole;
};

export type ShellData = WorkspaceContext & {
  workspaces: Workspace[];
  unread: number;
};

/** Loads everything the AppShell needs for a workspace page. */
export async function getShellData(workspaceId: string): Promise<ShellData | null> {
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return null;
  const [workspaces, unread] = await Promise.all([
    listWorkspacesForUser(ctx.user.id),
    countUnreadNotifications(ctx.user.id),
  ]);
  return { ...ctx, workspaces, unread };
}

/** Returns membership context, or null if unauthenticated or not a member. */
export async function getWorkspaceContext(
  workspaceId: string,
): Promise<WorkspaceContext | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const [workspace, membership] = await Promise.all([
    getWorkspaceById(workspaceId),
    getMembership(workspaceId, user.id),
  ]);
  if (!workspace || !membership) return null;
  return { user, workspace, role: membership.role };
}

/** Throws UNAUTHORIZED/FORBIDDEN unless the caller has at least `min` role. */
export async function requireWorkspaceRole(
  workspaceId: string,
  min: WorkspaceRole,
): Promise<WorkspaceContext> {
  const user = await requireUser();
  const [workspace, membership] = await Promise.all([
    getWorkspaceById(workspaceId),
    getMembership(workspaceId, user.id),
  ]);
  if (!workspace || !membership) throw new Error("UNAUTHORIZED");
  if (!atLeast(membership.role, min)) throw new Error("FORBIDDEN");
  return { user, workspace, role: membership.role };
}

/** Default statuses, labels seeded when a workspace is created. */
export async function seedWorkspaceDefaults(workspaceId: string): Promise<Status[]> {
  const defaults = [
    { name: "Backlog", color: "#64748b", is_done: false },
    { name: "In progress", color: "#2563eb", is_done: false },
    { name: "In review", color: "#d97706", is_done: false },
    { name: "Done", color: "#059669", is_done: true },
  ];
  const statuses: Status[] = [];
  for (let i = 0; i < defaults.length; i++) {
    statuses.push(
      await createStatus({
        workspace_id: workspaceId,
        name: defaults[i].name,
        color: defaults[i].color,
        position: i,
        is_done: defaults[i].is_done,
      }),
    );
  }

  const labels = [
    { name: "Bug", color: "#e11d48" },
    { name: "Feature", color: "#2563eb" },
    { name: "Urgent", color: "#d97706" },
  ];
  for (const label of labels) {
    await createLabel({ workspace_id: workspaceId, ...label });
  }

  return statuses;
}

export async function addOwner(workspaceId: string, userId: string): Promise<void> {
  await addMember(workspaceId, userId, "OWNER");
}

/**
 * Runs enabled automation rules when a task enters a status.
 * Currently supports notify_owner / notify_assignee actions.
 */
export async function runStatusAutomations(
  workspaceId: string,
  task: Task,
  newStatusId: string | null,
): Promise<void> {
  if (!newStatusId) return;
  const rules = await listAutomations(workspaceId);
  const matching = rules.filter(
    (r) => r.enabled && r.trigger_status_id === newStatusId,
  );
  if (matching.length === 0) return;

  const [statuses] = await Promise.all([listStatuses(workspaceId)]);
  const statusName = statuses.find((s) => s.id === newStatusId)?.name ?? "a status";

  for (const rule of matching) {
    const recipients = new Set<string>();
    if (rule.action === "notify_assignee" && task.assignee_id) {
      recipients.add(task.assignee_id);
    } else {
      // notify_owner (default): notify the task creator.
      recipients.add(task.created_by_id);
    }
    for (const userId of recipients) {
      await createNotification({
        user_id: userId,
        workspace_id: workspaceId,
        body: `Automation "${rule.name}": "${task.title}" moved to ${statusName}.`,
        link: `/w/${workspaceId}/tasks/${task.id}`,
      });
    }
  }
}

export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "workspace"}-${suffix}`;
}
