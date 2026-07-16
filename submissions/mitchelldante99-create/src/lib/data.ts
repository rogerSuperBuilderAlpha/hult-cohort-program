import { supabase } from "./supabase";
import { Project, Task, TaskStatus, TaskPriority, UserProfile } from "./types";

// ---------- Projects ----------

export function subscribeProjects(cb: (projects: Project[]) => void) {
  async function load() {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
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

export async function deleteProject(projectId: string) {
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw error;
}

// ---------- Tasks ----------

export function subscribeTasks(projectId: string, cb: (tasks: Task[]) => void) {
  async function load() {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
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
  projectId: string,
  taskId: string,
  status: TaskStatus,
  actingUserUid: string
) {
  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", taskId);
  if (error) throw error;

  if (status === "done") {
    await bumpStreak(actingUserUid);
  }
}

export async function deleteTask(projectId: string, taskId: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
}

// ---------- Streaks / motivation ----------

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  const dA = new Date(a + "T00:00:00");
  const dB = new Date(b + "T00:00:00");
  return Math.round((dB.getTime() - dA.getTime()) / 86400000);
}

async function bumpStreak(uid: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();
  if (!profile) return;

  const today = todayStr();

  if (profile.last_completed_date === today) {
    await supabase
      .from("profiles")
      .update({ total_completed: profile.total_completed + 1 })
      .eq("id", uid);
    return;
  }

  let newStreak = 1;
  if (profile.last_completed_date) {
    const gap = daysBetween(profile.last_completed_date, today);
    if (gap === 1) newStreak = profile.streak + 1;
  }

  await supabase
    .from("profiles")
    .update({
      streak: newStreak,
      last_completed_date: today,
      total_completed: profile.total_completed + 1,
    })
    .eq("id", uid);
}

export function subscribeLeaderboard(cb: (users: UserProfile[]) => void) {
  async function load() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("total_completed", { ascending: false });
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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("display_name", { ascending: true });
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
