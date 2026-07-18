"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TaskStatus } from "@/lib/types";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "blocked", "done"];

function tasksRedirectQuery(formData: FormData, extra: Record<string, string> = {}) {
  const params = new URLSearchParams();
  const project = String(formData.get("project") ?? "all");
  const assignee = String(formData.get("assignee") ?? "all");
  const status = String(formData.get("status_filter") ?? "all");
  params.set("project", project || "all");
  params.set("assignee", assignee || "all");
  params.set("status", status || "all");
  for (const [key, value] of Object.entries(extra)) {
    params.set(key, value);
  }
  return params.toString();
}

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const assigneeRaw = String(formData.get("assignee_id") ?? "").trim();
  const projectRaw = String(formData.get("project_id") ?? "").trim();
  const due_date = String(formData.get("due_date") ?? "").trim() || null;
  const assignee_id = assigneeRaw || null;
  const project_id = projectRaw || null;

  if (!title) {
    redirect("/tasks?error=" + encodeURIComponent("Title is required."));
  }

  const { error } = await supabase.from("tasks").insert({
    title,
    description,
    assignee_id,
    project_id,
    due_date,
    status: "todo",
    created_by: user.id,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect(`/tasks?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/projects");
  redirect(`/tasks?${tasksRedirectQuery(formData, { ok: "created" })}`);
}

export async function updateTaskStatus(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const taskId = String(formData.get("task_id") ?? "");
  const status = String(formData.get("status") ?? "") as TaskStatus;

  if (!taskId || !STATUSES.includes(status)) {
    redirect("/tasks?error=" + encodeURIComponent("Invalid status update."));
  }

  const { error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) {
    redirect(`/tasks?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/tasks");
  redirect(`/tasks?${tasksRedirectQuery(formData, { ok: "status" })}`);
}
