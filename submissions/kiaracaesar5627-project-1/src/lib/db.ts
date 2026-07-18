import { getSupabaseAdmin } from "./supabase";
import type {
  Activity,
  AutomationRule,
  Comment,
  CustomField,
  CustomFieldType,
  Label,
  Notification,
  Project,
  Status,
  Task,
  User,
  UserPrefs,
  UserPublic,
  Workspace,
  WorkspaceFeatures,
  WorkspaceMember,
  WorkspaceRole,
} from "./types";

export type ProjectWithRelations = Project & {
  owner?: UserPublic;
  tasks?: Task[];
};

export type TaskWithRelations = Task & {
  project?: Project;
  assignee?: UserPublic | null;
  labels?: Label[];
};

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function db() {
  return getSupabaseAdmin();
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await db().from("users").select("*").eq("id", id).maybeSingle();
  throwIfError(error);
  return data as User | null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await db().from("users").select("*").eq("email", email).maybeSingle();
  throwIfError(error);
  return data as User | null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await db()
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  throwIfError(error);
  return data as User | null;
}

export async function findUserByEmailOrUsername(
  email: string,
  username: string,
): Promise<User | null> {
  const byEmail = await findUserByEmail(email);
  if (byEmail) return byEmail;
  return findUserByUsername(username);
}

export async function createUser(input: {
  name: string;
  email: string;
  username: string;
  password_hash: string;
}): Promise<User> {
  const { data, error } = await db().from("users").insert(input).select("*").single();
  throwIfError(error);
  return data as User;
}

export async function listUsersPublic(): Promise<UserPublic[]> {
  const { data, error } = await db()
    .from("users")
    .select("id,email,username,name")
    .order("username", { ascending: true });
  throwIfError(error);
  return (data ?? []) as UserPublic[];
}

// ---------------------------------------------------------------------------
// Workspaces + membership
// ---------------------------------------------------------------------------
const DEFAULT_FEATURES: WorkspaceFeatures = {
  kanban: true,
  table: true,
  calendar: true,
  labels: true,
  customFields: true,
  comments: true,
  activity: true,
  automations: true,
  notifications: true,
  files: false,
  integrations: false,
  ai: false,
  gantt: false,
};

export async function createWorkspace(input: {
  name: string;
  slug: string;
  owner_id: string;
  accent_color?: string;
  features?: Partial<WorkspaceFeatures>;
}): Promise<Workspace> {
  const { data, error } = await db()
    .from("workspaces")
    .insert({
      name: input.name,
      slug: input.slug,
      owner_id: input.owner_id,
      accent_color: input.accent_color ?? "#2563eb",
      features: { ...DEFAULT_FEATURES, ...(input.features ?? {}) },
    })
    .select("*")
    .single();
  throwIfError(error);
  return data as Workspace;
}

export async function updateWorkspace(
  id: string,
  input: Partial<Pick<Workspace, "name" | "accent_color" | "features">>,
): Promise<Workspace> {
  const { data, error } = await db()
    .from("workspaces")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  throwIfError(error);
  return data as Workspace;
}

export async function getWorkspaceById(id: string): Promise<Workspace | null> {
  const { data, error } = await db().from("workspaces").select("*").eq("id", id).maybeSingle();
  throwIfError(error);
  return data as Workspace | null;
}

export async function slugExists(slug: string): Promise<boolean> {
  const { data, error } = await db()
    .from("workspaces")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  throwIfError(error);
  return Boolean(data);
}

export async function listWorkspacesForUser(userId: string): Promise<Workspace[]> {
  const { data, error } = await db()
    .from("workspace_members")
    .select("workspace:workspaces(*)")
    .eq("user_id", userId);
  throwIfError(error);
  const rows = (data ?? []) as unknown as { workspace: Workspace }[];
  return rows
    .map((r) => r.workspace)
    .filter(Boolean)
    .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
}

export async function addMember(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole,
): Promise<void> {
  const { error } = await db()
    .from("workspace_members")
    .upsert(
      { workspace_id: workspaceId, user_id: userId, role },
      { onConflict: "workspace_id,user_id" },
    );
  throwIfError(error);
}

export async function getMembership(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceMember | null> {
  const { data, error } = await db()
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();
  throwIfError(error);
  return data as WorkspaceMember | null;
}

export async function listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const { data, error } = await db()
    .from("workspace_members")
    .select("*, user:users!user_id(id,email,username,name)")
    .eq("workspace_id", workspaceId)
    .order("role", { ascending: true });
  throwIfError(error);
  return (data ?? []) as unknown as WorkspaceMember[];
}

export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole,
): Promise<void> {
  const { error } = await db()
    .from("workspace_members")
    .update({ role })
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);
  throwIfError(error);
}

export async function removeMember(workspaceId: string, userId: string): Promise<void> {
  const { error } = await db()
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);
  throwIfError(error);
}

// ---------------------------------------------------------------------------
// Statuses
// ---------------------------------------------------------------------------
export async function listStatuses(workspaceId: string): Promise<Status[]> {
  const { data, error } = await db()
    .from("statuses")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });
  throwIfError(error);
  return (data ?? []) as Status[];
}

export async function createStatus(input: {
  workspace_id: string;
  name: string;
  color: string;
  position: number;
  is_done?: boolean;
}): Promise<Status> {
  const { data, error } = await db()
    .from("statuses")
    .insert({ ...input, is_done: input.is_done ?? false })
    .select("*")
    .single();
  throwIfError(error);
  return data as Status;
}

export async function updateStatus(
  id: string,
  input: Partial<Pick<Status, "name" | "color" | "position" | "is_done">>,
): Promise<void> {
  const { error } = await db().from("statuses").update(input).eq("id", id);
  throwIfError(error);
}

export async function deleteStatus(id: string): Promise<void> {
  const { error } = await db().from("statuses").delete().eq("id", id);
  throwIfError(error);
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------
export async function listLabels(workspaceId: string): Promise<Label[]> {
  const { data, error } = await db()
    .from("labels")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });
  throwIfError(error);
  return (data ?? []) as Label[];
}

export async function createLabel(input: {
  workspace_id: string;
  name: string;
  color: string;
}): Promise<Label> {
  const { data, error } = await db().from("labels").insert(input).select("*").single();
  throwIfError(error);
  return data as Label;
}

export async function deleteLabel(id: string): Promise<void> {
  const { error } = await db().from("labels").delete().eq("id", id);
  throwIfError(error);
}

export async function setTaskLabels(taskId: string, labelIds: string[]): Promise<void> {
  const client = db();
  const { error: delErr } = await client.from("task_labels").delete().eq("task_id", taskId);
  throwIfError(delErr);
  if (labelIds.length) {
    const rows = labelIds.map((label_id) => ({ task_id: taskId, label_id }));
    const { error } = await client.from("task_labels").insert(rows);
    throwIfError(error);
  }
}

export async function listTaskLabels(taskId: string): Promise<Label[]> {
  const { data, error } = await db()
    .from("task_labels")
    .select("label:labels(*)")
    .eq("task_id", taskId);
  throwIfError(error);
  const rows = (data ?? []) as unknown as { label: Label }[];
  return rows.map((r) => r.label).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Custom fields
// ---------------------------------------------------------------------------
export async function listCustomFields(workspaceId: string): Promise<CustomField[]> {
  const { data, error } = await db()
    .from("custom_fields")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });
  throwIfError(error);
  return (data ?? []) as CustomField[];
}

export async function createCustomField(input: {
  workspace_id: string;
  name: string;
  type: CustomFieldType;
  options: string[];
  position: number;
}): Promise<CustomField> {
  const { data, error } = await db().from("custom_fields").insert(input).select("*").single();
  throwIfError(error);
  return data as CustomField;
}

export async function deleteCustomField(id: string): Promise<void> {
  const { error } = await db().from("custom_fields").delete().eq("id", id);
  throwIfError(error);
}

export async function getTaskFieldValues(
  taskId: string,
): Promise<Record<string, string>> {
  const { data, error } = await db()
    .from("task_field_values")
    .select("field_id,value")
    .eq("task_id", taskId);
  throwIfError(error);
  const out: Record<string, string> = {};
  for (const row of (data ?? []) as { field_id: string; value: string }[]) {
    out[row.field_id] = row.value;
  }
  return out;
}

export async function setTaskFieldValue(
  taskId: string,
  fieldId: string,
  value: string,
): Promise<void> {
  const { error } = await db()
    .from("task_field_values")
    .upsert(
      { task_id: taskId, field_id: fieldId, value },
      { onConflict: "task_id,field_id" },
    );
  throwIfError(error);
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export async function createProject(input: {
  name: string;
  description: string;
  owner_id: string;
  workspace_id: string;
  color?: string;
}): Promise<Project> {
  const { data, error } = await db()
    .from("projects")
    .insert({ ...input, color: input.color ?? "#2563eb" })
    .select("*")
    .single();
  throwIfError(error);
  return data as Project;
}

export async function updateProject(
  id: string,
  input: Partial<Pick<Project, "name" | "description" | "archived" | "color">>,
): Promise<Project> {
  const { data, error } = await db()
    .from("projects")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  throwIfError(error);
  return data as Project;
}

export async function listProjects(opts: {
  workspaceId: string;
  archived?: boolean;
  includeOwner?: boolean;
  includeTasks?: boolean;
}): Promise<ProjectWithRelations[]> {
  let select = "*";
  if (opts.includeOwner && opts.includeTasks)
    select = "*, owner:users!owner_id(id,email,username,name), tasks(*)";
  else if (opts.includeOwner) select = "*, owner:users!owner_id(id,email,username,name)";
  else if (opts.includeTasks) select = "*, tasks(*)";

  let query = db()
    .from("projects")
    .select(select)
    .eq("workspace_id", opts.workspaceId)
    .order("updated_at", { ascending: false });

  if (typeof opts.archived === "boolean") query = query.eq("archived", opts.archived);

  const { data, error } = await query;
  throwIfError(error);
  return (data as unknown as ProjectWithRelations[]) ?? [];
}

export async function getProjectById(id: string): Promise<ProjectWithRelations | null> {
  const { data, error } = await db()
    .from("projects")
    .select(
      "*, owner:users!owner_id(id,email,username,name), tasks(*, assignee:users!assignee_id(id,email,username,name))",
    )
    .eq("id", id)
    .maybeSingle();
  throwIfError(error);
  return data as unknown as ProjectWithRelations | null;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
export async function createTask(input: {
  title: string;
  description: string;
  project_id: string;
  assignee_id: string | null;
  status_id: string | null;
  due_date: string | null;
  created_by_id: string;
  position?: number;
}): Promise<Task> {
  const { data, error } = await db()
    .from("tasks")
    .insert({ ...input, position: input.position ?? 0 })
    .select("*")
    .single();
  throwIfError(error);
  return data as Task;
}

export async function updateTask(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    assignee_id: string | null;
    status_id: string | null;
    due_date: string | null;
    position: number;
  }>,
): Promise<Task> {
  const { data, error } = await db()
    .from("tasks")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  throwIfError(error);
  return data as Task;
}

export async function getTaskById(id: string): Promise<TaskWithRelations | null> {
  const { data, error } = await db()
    .from("tasks")
    .select(
      "*, project:projects(*), assignee:users!assignee_id(id,email,username,name)",
    )
    .eq("id", id)
    .maybeSingle();
  throwIfError(error);
  return data as unknown as TaskWithRelations | null;
}

export async function listTasksForProject(projectId: string): Promise<TaskWithRelations[]> {
  const { data, error } = await db()
    .from("tasks")
    .select("*, assignee:users!assignee_id(id,email,username,name), task_labels(label:labels(*))")
    .eq("project_id", projectId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  throwIfError(error);
  type Row = TaskWithRelations & { task_labels?: { label: Label }[] };
  return ((data ?? []) as unknown as Row[]).map((row) => ({
    ...row,
    labels: (row.task_labels ?? []).map((tl) => tl.label).filter(Boolean),
  }));
}

export async function listTasksForWorkspace(
  workspaceId: string,
): Promise<TaskWithRelations[]> {
  const projects = await listProjects({ workspaceId });
  const ids = projects.map((p) => p.id);
  if (ids.length === 0) return [];
  const { data, error } = await db()
    .from("tasks")
    .select("*, project:projects(*), assignee:users!assignee_id(id,email,username,name)")
    .in("project_id", ids)
    .order("updated_at", { ascending: false });
  throwIfError(error);
  return (data as unknown as TaskWithRelations[]) ?? [];
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------
export async function listComments(taskId: string): Promise<Comment[]> {
  const { data, error } = await db()
    .from("comments")
    .select("*, user:users!user_id(id,email,username,name)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  throwIfError(error);
  return (data ?? []) as unknown as Comment[];
}

export async function createComment(input: {
  task_id: string;
  user_id: string;
  body: string;
}): Promise<Comment> {
  const { data, error } = await db().from("comments").insert(input).select("*").single();
  throwIfError(error);
  return data as Comment;
}

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------
export async function logActivity(input: {
  workspace_id: string;
  project_id?: string | null;
  task_id?: string | null;
  user_id?: string | null;
  verb: string;
  detail?: string;
}): Promise<void> {
  const { error } = await db()
    .from("activity")
    .insert({ detail: "", ...input });
  throwIfError(error);
}

export async function listActivity(
  workspaceId: string,
  limit = 40,
): Promise<Activity[]> {
  const { data, error } = await db()
    .from("activity")
    .select("*, user:users!user_id(id,email,username,name)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);
  throwIfError(error);
  return (data ?? []) as unknown as Activity[];
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export async function createNotification(input: {
  user_id: string;
  workspace_id: string | null;
  body: string;
  link?: string;
}): Promise<void> {
  const { error } = await db()
    .from("notifications")
    .insert({ link: "", ...input });
  throwIfError(error);
}

export async function listNotifications(userId: string, limit = 30): Promise<Notification[]> {
  const { data, error } = await db()
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  throwIfError(error);
  return (data ?? []) as Notification[];
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const { count, error } = await db()
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  throwIfError(error);
  return count ?? 0;
}

export async function markNotificationsRead(userId: string): Promise<void> {
  const { error } = await db()
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  throwIfError(error);
}

// ---------------------------------------------------------------------------
// Automations
// ---------------------------------------------------------------------------
export async function listAutomations(workspaceId: string): Promise<AutomationRule[]> {
  const { data, error } = await db()
    .from("automation_rules")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });
  throwIfError(error);
  return (data ?? []) as AutomationRule[];
}

export async function createAutomation(input: {
  workspace_id: string;
  name: string;
  trigger_status_id: string | null;
  action: string;
}): Promise<AutomationRule> {
  const { data, error } = await db()
    .from("automation_rules")
    .insert(input)
    .select("*")
    .single();
  throwIfError(error);
  return data as AutomationRule;
}

export async function setAutomationEnabled(id: string, enabled: boolean): Promise<void> {
  const { error } = await db().from("automation_rules").update({ enabled }).eq("id", id);
  throwIfError(error);
}

export async function deleteAutomation(id: string): Promise<void> {
  const { error } = await db().from("automation_rules").delete().eq("id", id);
  throwIfError(error);
}

// ---------------------------------------------------------------------------
// User preferences
// ---------------------------------------------------------------------------
export async function getUserPrefs(userId: string): Promise<UserPrefs | null> {
  const { data, error } = await db()
    .from("user_prefs")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  throwIfError(error);
  return data as UserPrefs | null;
}

export async function upsertUserPrefs(input: {
  user_id: string;
  theme: string;
  accent_color: string;
}): Promise<void> {
  const { error } = await db()
    .from("user_prefs")
    .upsert({ ...input, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  throwIfError(error);
}
