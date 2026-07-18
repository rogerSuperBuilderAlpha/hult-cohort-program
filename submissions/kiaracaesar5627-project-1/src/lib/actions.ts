"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createSession,
  destroySession,
  hashPassword,
  requireUser,
  verifyPassword,
} from "./auth";
import {
  addMember,
  createAutomation,
  createComment,
  createCustomField,
  createLabel,
  createNotification,
  createProject,
  createStatus,
  createTask,
  createUser,
  createWorkspace,
  deleteAutomation,
  deleteCustomField,
  deleteLabel,
  deleteStatus,
  findUserByEmail,
  findUserByEmailOrUsername,
  findUserByUsername,
  getProjectById,
  getTaskById,
  getUserPrefs,
  listStatuses,
  logActivity,
  markNotificationsRead,
  removeMember,
  setAutomationEnabled,
  setTaskFieldValue,
  setTaskLabels,
  updateMemberRole,
  updateProject,
  updateStatus,
  updateTask,
  updateWorkspace,
  upsertUserPrefs,
} from "./db";
import {
  ACCENT_COOKIE,
  DEFAULT_ACCENT,
  isTheme,
  normalizeAccent,
  THEME_COOKIE,
} from "./theme";
import type { CustomFieldType, WorkspaceRole } from "./types";
import {
  requireWorkspaceRole,
  runStatusAutomations,
  seedWorkspaceDefaults,
  slugify,
} from "./workspace-server";

export type ActionResult = { ok: true } | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  username: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, "Username: letters, numbers, _ or -"),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

async function syncThemeCookies(userId: string) {
  const prefs = await getUserPrefs(userId);
  const jar = await cookies();
  jar.set(THEME_COOKIE, prefs?.theme ?? "light", { path: "/", maxAge: 60 * 60 * 24 * 365 });
  jar.set(ACCENT_COOKIE, prefs?.accent_color ?? DEFAULT_ACCENT, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();
  const username = parsed.data.username.toLowerCase();
  if (await findUserByEmailOrUsername(email, username)) {
    return { ok: false, error: "Email or username already in use" };
  }

  const user = await createUser({
    name: parsed.data.name,
    email,
    username,
    password_hash: await hashPassword(parsed.data.password),
  });

  await createSession({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
  });
  await syncThemeCookies(user.id);
  redirect("/workspaces");
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid email or password" };

  const user = await findUserByEmail(parsed.data.email.toLowerCase());
  if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) {
    return { ok: false, error: "Invalid email or password" };
  }

  await createSession({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
  });
  await syncThemeCookies(user.id);
  redirect("/workspaces");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Theme / preferences
// ---------------------------------------------------------------------------
export async function updateThemeAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const themeRaw = String(formData.get("theme") ?? "light");
  const theme = isTheme(themeRaw) ? themeRaw : "light";
  const accent = normalizeAccent(String(formData.get("accent") ?? ""));

  await upsertUserPrefs({ user_id: user.id, theme, accent_color: accent });
  const jar = await cookies();
  jar.set(THEME_COOKIE, theme, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  jar.set(ACCENT_COOKIE, accent, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  const redirectTo = String(formData.get("redirectTo") ?? "/account");
  revalidatePath(redirectTo);
  redirect(redirectTo);
}

// ---------------------------------------------------------------------------
// Workspaces
// ---------------------------------------------------------------------------
export async function createWorkspaceAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const accent = normalizeAccent(String(formData.get("accent") ?? ""));
  if (!name) return;

  const workspace = await createWorkspace({
    name,
    slug: slugify(name),
    owner_id: user.id,
    accent_color: accent,
  });
  await addMember(workspace.id, user.id, "OWNER");
  await seedWorkspaceDefaults(workspace.id);
  await logActivity({
    workspace_id: workspace.id,
    user_id: user.id,
    verb: "created workspace",
    detail: name,
  });

  redirect(`/w/${workspace.id}`);
}

export async function updateWorkspaceAppearanceAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  await requireWorkspaceRole(id, "ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const accent = normalizeAccent(String(formData.get("accent") ?? ""));
  if (!name) return;
  await updateWorkspace(id, { name, accent_color: accent });
  revalidatePath(`/w/${id}`, "layout");
}

const FEATURE_KEYS = [
  "kanban",
  "table",
  "calendar",
  "labels",
  "customFields",
  "comments",
  "activity",
  "automations",
  "notifications",
  "files",
  "integrations",
  "ai",
  "gantt",
] as const;

export async function updateWorkspaceFeaturesAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  const ctx = await requireWorkspaceRole(id, "ADMIN");
  const features = { ...ctx.workspace.features };
  for (const key of FEATURE_KEYS) {
    features[key] = formData.get(`feature_${key}`) === "on";
  }
  await updateWorkspace(id, { features });
  revalidatePath(`/w/${id}`, "layout");
  revalidatePath(`/w/${id}/settings`);
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------
function parseRole(raw: string): WorkspaceRole {
  return ["OWNER", "ADMIN", "MANAGER", "MEMBER", "GUEST"].includes(raw)
    ? (raw as WorkspaceRole)
    : "MEMBER";
}

export async function addMemberAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  const ctx = await requireWorkspaceRole(id, "ADMIN");
  const identifier = String(formData.get("identifier") ?? "").trim().toLowerCase();
  const role = parseRole(String(formData.get("role") ?? "MEMBER"));
  if (!identifier || role === "OWNER") return;

  const target =
    (await findUserByEmail(identifier)) ?? (await findUserByUsername(identifier));
  if (!target) return;

  await addMember(id, target.id, role);
  await logActivity({
    workspace_id: id,
    user_id: ctx.user.id,
    verb: "added member",
    detail: `@${target.username} as ${role}`,
  });
  await createNotification({
    user_id: target.id,
    workspace_id: id,
    body: `You were added to "${ctx.workspace.name}" as ${role}.`,
    link: `/w/${id}`,
  });
  revalidatePath(`/w/${id}/members`);
}

export async function updateMemberRoleAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  const ctx = await requireWorkspaceRole(id, "ADMIN");
  const userId = String(formData.get("userId") ?? "");
  const role = parseRole(String(formData.get("role") ?? "MEMBER"));
  if (!userId || role === "OWNER") return;
  if (userId === ctx.workspace.owner_id) return; // never demote the owner
  await updateMemberRole(id, userId, role);
  revalidatePath(`/w/${id}/members`);
}

export async function removeMemberAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  const ctx = await requireWorkspaceRole(id, "ADMIN");
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === ctx.workspace.owner_id) return;
  await removeMember(id, userId);
  revalidatePath(`/w/${id}/members`);
}

// ---------------------------------------------------------------------------
// Statuses
// ---------------------------------------------------------------------------
export async function createStatusAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  await requireWorkspaceRole(id, "ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const color = normalizeAccent(String(formData.get("color") ?? "#64748b"));
  const isDone = formData.get("isDone") === "on";
  if (!name) return;
  const existing = await listStatuses(id);
  await createStatus({
    workspace_id: id,
    name,
    color,
    position: existing.length,
    is_done: isDone,
  });
  revalidatePath(`/w/${id}/settings`);
}

export async function updateStatusAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  await requireWorkspaceRole(id, "ADMIN");
  const statusId = String(formData.get("statusId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const color = normalizeAccent(String(formData.get("color") ?? "#64748b"));
  const isDone = formData.get("isDone") === "on";
  if (!statusId || !name) return;
  await updateStatus(statusId, { name, color, is_done: isDone });
  revalidatePath(`/w/${id}/settings`);
}

export async function deleteStatusAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  await requireWorkspaceRole(id, "ADMIN");
  const statusId = String(formData.get("statusId") ?? "");
  if (!statusId) return;
  await deleteStatus(statusId);
  revalidatePath(`/w/${id}/settings`);
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------
export async function createLabelAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  await requireWorkspaceRole(id, "ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const color = normalizeAccent(String(formData.get("color") ?? "#2563eb"));
  if (!name) return;
  await createLabel({ workspace_id: id, name, color });
  revalidatePath(`/w/${id}/settings`);
}

export async function deleteLabelAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  await requireWorkspaceRole(id, "ADMIN");
  const labelId = String(formData.get("labelId") ?? "");
  if (!labelId) return;
  await deleteLabel(labelId);
  revalidatePath(`/w/${id}/settings`);
}

// ---------------------------------------------------------------------------
// Custom fields
// ---------------------------------------------------------------------------
export async function createCustomFieldAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  await requireWorkspaceRole(id, "ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "text");
  const type: CustomFieldType = (
    ["text", "number", "date", "select", "checkbox"].includes(typeRaw) ? typeRaw : "text"
  ) as CustomFieldType;
  const optionsRaw = String(formData.get("options") ?? "");
  const options = optionsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!name) return;
  await createCustomField({ workspace_id: id, name, type, options, position: 0 });
  revalidatePath(`/w/${id}/settings`);
}

export async function deleteCustomFieldAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  await requireWorkspaceRole(id, "ADMIN");
  const fieldId = String(formData.get("fieldId") ?? "");
  if (!fieldId) return;
  await deleteCustomField(fieldId);
  revalidatePath(`/w/${id}/settings`);
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export async function createProjectAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  const ctx = await requireWorkspaceRole(id, "MANAGER");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const color = normalizeAccent(String(formData.get("color") ?? ctx.workspace.accent_color));
  if (!name) return;
  const project = await createProject({
    name,
    description,
    owner_id: ctx.user.id,
    workspace_id: id,
    color,
  });
  await logActivity({
    workspace_id: id,
    project_id: project.id,
    user_id: ctx.user.id,
    verb: "created project",
    detail: name,
  });
  revalidatePath(`/w/${id}`);
  revalidatePath(`/w/${id}/projects`);
}

export async function updateProjectAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  await requireWorkspaceRole(id, "MANAGER");
  const projectId = String(formData.get("projectId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const color = normalizeAccent(String(formData.get("color") ?? "#2563eb"));
  if (!projectId || !name) return;
  await updateProject(projectId, { name, description, color });
  revalidatePath(`/w/${id}/projects/${projectId}`);
  revalidatePath(`/w/${id}/projects`);
}

export async function archiveProjectAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  await requireWorkspaceRole(id, "MANAGER");
  const projectId = String(formData.get("projectId") ?? "");
  const archived = String(formData.get("archived") ?? "true") === "true";
  if (!projectId) return;
  await updateProject(projectId, { archived });
  revalidatePath(`/w/${id}/projects`);
  revalidatePath(`/w/${id}/projects/${projectId}`);
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
async function resolveWorkspaceForProject(projectId: string): Promise<string | null> {
  const project = await getProjectById(projectId);
  return project?.workspace_id ?? null;
}

export async function createTaskAction(formData: FormData): Promise<void> {
  const projectId = String(formData.get("projectId") ?? "");
  const workspaceId = await resolveWorkspaceForProject(projectId);
  if (!workspaceId) return;
  const ctx = await requireWorkspaceRole(workspaceId, "MEMBER");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const assigneeId = String(formData.get("assigneeId") ?? "") || null;
  let statusId = String(formData.get("statusId") ?? "") || null;
  const dueRaw = String(formData.get("dueDate") ?? "");
  if (!title) return;

  const statuses = await listStatuses(workspaceId);
  if (!statusId || !statuses.some((s) => s.id === statusId)) {
    statusId = statuses[0]?.id ?? null;
  }

  const task = await createTask({
    title,
    description,
    project_id: projectId,
    assignee_id: assigneeId,
    status_id: statusId,
    due_date: dueRaw ? new Date(dueRaw).toISOString() : null,
    created_by_id: ctx.user.id,
  });
  await logActivity({
    workspace_id: workspaceId,
    project_id: projectId,
    task_id: task.id,
    user_id: ctx.user.id,
    verb: "created task",
    detail: title,
  });

  revalidatePath(`/w/${workspaceId}`);
  revalidatePath(`/w/${workspaceId}/projects/${projectId}`);
}

export async function updateTaskAction(formData: FormData): Promise<void> {
  const taskId = String(formData.get("taskId") ?? "");
  const task = await getTaskById(taskId);
  if (!task?.project?.workspace_id) return;
  const workspaceId = task.project.workspace_id;
  const ctx = await requireWorkspaceRole(workspaceId, "MEMBER");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const assigneeId = String(formData.get("assigneeId") ?? "") || null;
  const statusId = String(formData.get("statusId") ?? "") || null;
  const dueRaw = String(formData.get("dueDate") ?? "");
  if (!title) return;

  const prevStatus = task.status_id;
  const updated = await updateTask(taskId, {
    title,
    description,
    assignee_id: assigneeId,
    status_id: statusId,
    due_date: dueRaw ? new Date(dueRaw).toISOString() : null,
  });

  if (statusId && statusId !== prevStatus) {
    await runStatusAutomations(workspaceId, updated, statusId);
  }
  await logActivity({
    workspace_id: workspaceId,
    project_id: task.project_id,
    task_id: taskId,
    user_id: ctx.user.id,
    verb: "updated task",
    detail: title,
  });

  revalidatePath(`/w/${workspaceId}/projects/${task.project_id}`);
  revalidatePath(`/w/${workspaceId}/tasks/${taskId}`);
}

/** Kanban drag-and-drop: move a task to a new status + position. */
export async function moveTaskAction(formData: FormData): Promise<void> {
  const taskId = String(formData.get("taskId") ?? "");
  const statusId = String(formData.get("statusId") ?? "") || null;
  const position = Number(formData.get("position") ?? 0) || 0;
  const task = await getTaskById(taskId);
  if (!task?.project?.workspace_id) return;
  const workspaceId = task.project.workspace_id;
  const ctx = await requireWorkspaceRole(workspaceId, "MEMBER");

  const prevStatus = task.status_id;
  const updated = await updateTask(taskId, { status_id: statusId, position });
  if (statusId && statusId !== prevStatus) {
    await runStatusAutomations(workspaceId, updated, statusId);
    await logActivity({
      workspace_id: workspaceId,
      project_id: task.project_id,
      task_id: taskId,
      user_id: ctx.user.id,
      verb: "moved task",
      detail: updated.title,
    });
  }
  revalidatePath(`/w/${workspaceId}/projects/${task.project_id}`);
}

export async function setTaskLabelsAction(formData: FormData): Promise<void> {
  const taskId = String(formData.get("taskId") ?? "");
  const task = await getTaskById(taskId);
  if (!task?.project?.workspace_id) return;
  const workspaceId = task.project.workspace_id;
  await requireWorkspaceRole(workspaceId, "MEMBER");
  const labelIds = formData.getAll("labelId").map(String).filter(Boolean);
  await setTaskLabels(taskId, labelIds);
  revalidatePath(`/w/${workspaceId}/tasks/${taskId}`);
  revalidatePath(`/w/${workspaceId}/projects/${task.project_id}`);
}

export async function setTaskFieldAction(formData: FormData): Promise<void> {
  const taskId = String(formData.get("taskId") ?? "");
  const fieldId = String(formData.get("fieldId") ?? "");
  const value = String(formData.get("value") ?? "");
  const task = await getTaskById(taskId);
  if (!task?.project?.workspace_id || !fieldId) return;
  const workspaceId = task.project.workspace_id;
  await requireWorkspaceRole(workspaceId, "MEMBER");
  await setTaskFieldValue(taskId, fieldId, value);
  revalidatePath(`/w/${workspaceId}/tasks/${taskId}`);
}

export async function addCommentAction(formData: FormData): Promise<void> {
  const taskId = String(formData.get("taskId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const task = await getTaskById(taskId);
  if (!task?.project?.workspace_id || !body) return;
  const workspaceId = task.project.workspace_id;
  const ctx = await requireWorkspaceRole(workspaceId, "MEMBER");
  await createComment({ task_id: taskId, user_id: ctx.user.id, body });
  await logActivity({
    workspace_id: workspaceId,
    project_id: task.project_id,
    task_id: taskId,
    user_id: ctx.user.id,
    verb: "commented",
    detail: task.title,
  });
  if (task.assignee_id && task.assignee_id !== ctx.user.id) {
    await createNotification({
      user_id: task.assignee_id,
      workspace_id: workspaceId,
      body: `@${ctx.user.username} commented on "${task.title}".`,
      link: `/w/${workspaceId}/tasks/${taskId}`,
    });
  }
  revalidatePath(`/w/${workspaceId}/tasks/${taskId}`);
}

// ---------------------------------------------------------------------------
// Automations
// ---------------------------------------------------------------------------
export async function createAutomationAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  await requireWorkspaceRole(id, "ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const triggerStatusId = String(formData.get("triggerStatusId") ?? "") || null;
  const action = String(formData.get("action") ?? "notify_owner");
  if (!name || !triggerStatusId) return;
  await createAutomation({
    workspace_id: id,
    name,
    trigger_status_id: triggerStatusId,
    action: ["notify_owner", "notify_assignee"].includes(action) ? action : "notify_owner",
  });
  revalidatePath(`/w/${id}/settings`);
}

export async function toggleAutomationAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  await requireWorkspaceRole(id, "ADMIN");
  const ruleId = String(formData.get("ruleId") ?? "");
  const enabled = String(formData.get("enabled") ?? "true") === "true";
  if (!ruleId) return;
  await setAutomationEnabled(ruleId, enabled);
  revalidatePath(`/w/${id}/settings`);
}

export async function deleteAutomationAction(formData: FormData): Promise<void> {
  const id = String(formData.get("workspaceId") ?? "");
  await requireWorkspaceRole(id, "ADMIN");
  const ruleId = String(formData.get("ruleId") ?? "");
  if (!ruleId) return;
  await deleteAutomation(ruleId);
  revalidatePath(`/w/${id}/settings`);
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export async function markNotificationsReadAction(): Promise<void> {
  const user = await requireUser();
  await markNotificationsRead(user.id);
  revalidatePath("/notifications", "layout");
}
