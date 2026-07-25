import { getSupabaseAdmin } from "./supabase";
import type { Project, Task, TaskStatus, User, UserPublic } from "./types";

export type ProjectWithRelations = Project & {
  owner?: UserPublic;
  tasks?: Task[];
};

export type TaskWithRelations = Task & {
  project?: Project;
  assignee?: UserPublic | null;
};

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIfError(error);
  return data as User | null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .select("*")
    .eq("email", email)
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
  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  throwIfError(error);
  return data as User | null;
}

export async function createUser(input: {
  name: string;
  email: string;
  username: string;
  password_hash: string;
}): Promise<User> {
  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .insert(input)
    .select("*")
    .single();
  throwIfError(error);
  return data as User;
}

export async function listUsersPublic(): Promise<UserPublic[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .select("id,email,username,name")
    .order("username", { ascending: true });
  throwIfError(error);
  return (data ?? []) as UserPublic[];
}

export async function createProject(input: {
  name: string;
  description: string;
  owner_id: string;
}): Promise<Project> {
  const { data, error } = await getSupabaseAdmin()
    .from("projects")
    .insert(input)
    .select("*")
    .single();
  throwIfError(error);
  return data as Project;
}

export async function updateProject(
  id: string,
  input: Partial<Pick<Project, "name" | "description" | "archived">>,
): Promise<Project> {
  const { data, error } = await getSupabaseAdmin()
    .from("projects")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  throwIfError(error);
  return data as Project;
}

export async function listProjects(opts?: {
  archived?: boolean;
  includeOwner?: boolean;
  includeTasks?: boolean;
}): Promise<ProjectWithRelations[]> {
  let select = "*";
  if (opts?.includeOwner && opts?.includeTasks) select = "*, owner:users!owner_id(*), tasks(*)";
  else if (opts?.includeOwner) select = "*, owner:users!owner_id(*)";
  else if (opts?.includeTasks) select = "*, tasks(*)";

  let query = getSupabaseAdmin()
    .from("projects")
    .select(select)
    .order("updated_at", { ascending: false });

  if (typeof opts?.archived === "boolean") {
    query = query.eq("archived", opts.archived);
  } else {
    query = query.order("archived", { ascending: true });
  }

  const { data, error } = await query;
  throwIfError(error);
  return (data as unknown as ProjectWithRelations[]) ?? [];
}

export async function getProjectById(id: string): Promise<ProjectWithRelations | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("projects")
    .select("*, owner:users!owner_id(*), tasks(*, assignee:users!assignee_id(*))")
    .eq("id", id)
    .maybeSingle();
  throwIfError(error);
  return data as unknown as ProjectWithRelations | null;
}

export async function createTask(input: {
  title: string;
  description: string;
  project_id: string;
  assignee_id: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_by_id: string;
}): Promise<Task> {
  const { data, error } = await getSupabaseAdmin()
    .from("tasks")
    .insert(input)
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
    status: TaskStatus;
    due_date: string | null;
  }>,
): Promise<Task> {
  const { data, error } = await getSupabaseAdmin()
    .from("tasks")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  throwIfError(error);
  return data as Task;
}

export async function listTasks(filters: {
  projectId?: string;
  status?: TaskStatus;
  assigneeId?: string;
}): Promise<TaskWithRelations[]> {
  let query = getSupabaseAdmin()
    .from("tasks")
    .select("*, project:projects(*), assignee:users!assignee_id(*)")
    .order("updated_at", { ascending: false });

  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.assigneeId) query = query.eq("assignee_id", filters.assigneeId);

  const { data, error } = await query;
  throwIfError(error);
  return (data as unknown as TaskWithRelations[]) ?? [];
}

export async function listOpenTasksForUser(userId: string): Promise<TaskWithRelations[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("tasks")
    .select("*, project:projects(*)")
    .eq("assignee_id", userId)
    .neq("status", "DONE")
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(5);
  throwIfError(error);
  return (data as unknown as TaskWithRelations[]) ?? [];
}

export async function countTasks(opts?: {
  status?: TaskStatus;
  statusNot?: TaskStatus;
  updatedSince?: string;
}) {
  let query = getSupabaseAdmin()
    .from("tasks")
    .select("*", { count: "exact", head: true });

  if (opts?.status) query = query.eq("status", opts.status);
  if (opts?.statusNot) query = query.neq("status", opts.statusNot);
  if (opts?.updatedSince) query = query.gte("updated_at", opts.updatedSince);

  const { count, error } = await query;
  throwIfError(error);
  return count ?? 0;
}
