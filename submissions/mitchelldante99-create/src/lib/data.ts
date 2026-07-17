import { supabase } from "./supabase";
import { Project, Task, TaskStatus, TaskPriority, UserProfile } from "./types";

// ---------- Projects ----------

export function subscribeProjects(cb: (projects: Project[]) => void) {
  async function load() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("subscribeProjects load error:", error);
    cb((data as Project[]) || []);
  }
  load();

  const channel = supabase
    .channel("projects-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, load)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function createProject(
  name: string,
  description: string,
  createdBy: string,
  createdByName: string
) {
  const { error } = await supabase.from("projects").insert({
    name,
    description,
    created_by: createdBy,
    created_by_name: createdByName,
  });
  if (error) throw error;
}

export async function updateProject(
  projectId: string,
  updates: { name?: string; description?: string }
) {
  const { error } = await supabase.from("projects").update(updates).eq("id", projectId);
  if (error) throw error;
}

export async function setProjectArchived(projectId: string, archived: boolean) {
  const { error } = await supabase
    .from("projects")
    .update({ archived })
    .eq("id", projectId);
  if (error) throw error;
}

// ---------- Tasks ----------

export function subscribeTasks(projectId: string, cb: (tasks: Task[]) => void) {
  async function load() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) console.error("subscribeTasks load error:", error);
    cb((data as Task[]) || []);
  }
  load();

  const channel = supabase
    .channel(`tasks-changes-${projectId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` },
      load
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function createTask(
  projectId: string,
  data: {
    name: string;
    description: string;
    priority: TaskPriority;
    dueDate: string | null;
    assigneeUid: string | null;
    assigneeName: string | null;
    createdBy: string;
  }
) {
  const { error } = await supabase.from("tasks").insert({
    project_id: projectId,
    name: data.name,
    description: data.description,
    priority: data.priority,
    due_date: data.dueDate,
    assignee_id: data.assigneeUid,
    assignee_name: data.assigneeName,
    created_by: data.createdBy,
    status: "todo",
  });
  if (error) throw error;
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
) {
  if (status === "done") {
    const { error } = await supabase.rpc("complete_task", { p_task_id: taskId });
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("tasks")
    .update({ status, completed_at: null })
    .eq("id", taskId);
  if (error) throw error;
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
}

// Streak bumping now happens server-side in the complete_task() Postgres
// function (see supabase_migration_2.sql) so clients can't self-report
// fake completions by writing directly to profiles.streak/total_completed.

export function subscribeLeaderboard(cb: (users: UserProfile[]) => void) {
  async function load() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("total_completed", { ascending: false });
    if (error) console.error("subscribeLeaderboard load error:", error);
    cb((data as UserProfile[]) || []);
  }
  load();

  const channel = supabase
    .channel("leaderboard-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, load)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeAllUsers(cb: (users: UserProfile[]) => void) {
  async function load() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("display_name", { ascending: true });
    if (error) console.error("subscribeAllUsers load error:", error);
    cb((data as UserProfile[]) || []);
  }
  load();

  const channel = supabase
    .channel("all-users-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, load)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
