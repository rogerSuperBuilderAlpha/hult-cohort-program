"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TaskStatus } from "@/lib/types";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "blocked", "done"];

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const assigneeRaw = String(formData.get("assignee_id") ?? "").trim();
  const due_date = String(formData.get("due_date") ?? "").trim() || null;
  const assignee_id = assigneeRaw || null;

  if (!title) {
    redirect("/tasks?error=" + encodeURIComponent("Title is required."));
  }

  const { error } = await supabase.from("tasks").insert({
    title,
    description,
    assignee_id,
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
  redirect("/tasks?ok=created");
}

export async function updateTaskStatus(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const taskId = String(formData.get("task_id") ?? "");
  const status = String(formData.get("status") ?? "") as TaskStatus;
  const filter = String(formData.get("filter") ?? "all");

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
  redirect(`/tasks?filter=${encodeURIComponent(filter)}&ok=status`);
}
