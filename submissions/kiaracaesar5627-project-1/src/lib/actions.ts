"use server";

import { revalidatePath } from "next/cache";
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
  createProject,
  createTask,
  createUser,
  findUserByEmail,
  findUserByEmailOrUsername,
  findUserById,
  getProjectById,
  updateProject,
  updateTask,
} from "./db";
import type { TaskStatus } from "./types";

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

export type ActionResult = { ok: true } | { ok: false; error: string };

function parseStatus(raw: string): TaskStatus {
  return ["TODO", "IN_PROGRESS", "DONE"].includes(raw)
    ? (raw as TaskStatus)
    : "TODO";
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
  const existing = await findUserByEmailOrUsername(email, username);
  if (existing) {
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
  redirect("/dashboard");
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid email or password" };
  }

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
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function createProjectAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return;

  await createProject({
    name,
    description,
    owner_id: user.id,
  });
  revalidatePath("/dashboard");
  revalidatePath("/projects");
}

export async function updateProjectAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!id || !name) return;

  await updateProject(id, { name, description });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/dashboard");
}

export async function archiveProjectAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const archived = String(formData.get("archived") ?? "true") === "true";
  if (!id) return;

  await updateProject(id, { archived });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/dashboard");
}

export async function createTaskAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "");
  const assigneeId = String(formData.get("assigneeId") ?? "") || null;
  const status = parseStatus(String(formData.get("status") ?? "TODO"));
  const dueRaw = String(formData.get("dueDate") ?? "");

  if (!title || !projectId) return;

  const project = await getProjectById(projectId);
  if (!project || project.archived) return;

  if (assigneeId) {
    const assignee = await findUserById(assigneeId);
    if (!assignee) return;
  }

  await createTask({
    title,
    description,
    project_id: projectId,
    assignee_id: assigneeId,
    status,
    due_date: dueRaw ? new Date(dueRaw).toISOString() : null,
    created_by_id: user.id,
  });

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  revalidatePath(`/projects/${projectId}`);
}

export async function updateTaskAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const assigneeId = String(formData.get("assigneeId") ?? "") || null;
  const status = parseStatus(String(formData.get("status") ?? "TODO"));
  const dueRaw = String(formData.get("dueDate") ?? "");

  if (!title) return;

  const task = await updateTask(id, {
    title,
    description,
    assignee_id: assigneeId,
    status,
    due_date: dueRaw ? new Date(dueRaw).toISOString() : null,
  });

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  revalidatePath(`/projects/${task.project_id}`);
}

export async function setTaskStatusAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  if (!id || !["TODO", "IN_PROGRESS", "DONE"].includes(statusRaw)) return;

  const task = await updateTask(id, { status: statusRaw as TaskStatus });

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  revalidatePath(`/projects/${task.project_id}`);
}
