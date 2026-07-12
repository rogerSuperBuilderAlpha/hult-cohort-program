"use server";

import { TaskStatus } from "@prisma/client";
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
import { prisma } from "./prisma";

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
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return { ok: false, error: "Email or username already in use" };
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      username,
      passwordHash: await hashPassword(parsed.data.password),
    },
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

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
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

  await prisma.project.create({
    data: {
      name,
      description,
      ownerId: user.id,
    },
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

  await prisma.project.update({
    where: { id },
    data: { name, description },
  });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/dashboard");
}

export async function archiveProjectAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const archived = String(formData.get("archived") ?? "true") === "true";
  if (!id) return;

  await prisma.project.update({
    where: { id },
    data: { archived },
  });
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
  const statusRaw = String(formData.get("status") ?? "TODO");
  const dueRaw = String(formData.get("dueDate") ?? "");
  const status = ["TODO", "IN_PROGRESS", "DONE"].includes(statusRaw)
    ? (statusRaw as TaskStatus)
    : TaskStatus.TODO;

  if (!title || !projectId) return;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.archived) return;

  if (assigneeId) {
    const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
    if (!assignee) return;
  }

  await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      assigneeId,
      status,
      dueDate: dueRaw ? new Date(dueRaw) : null,
      createdById: user.id,
    },
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
  const statusRaw = String(formData.get("status") ?? "TODO");
  const dueRaw = String(formData.get("dueDate") ?? "");
  const status = ["TODO", "IN_PROGRESS", "DONE"].includes(statusRaw)
    ? (statusRaw as TaskStatus)
    : TaskStatus.TODO;

  if (!title) return;

  const task = await prisma.task.update({
    where: { id },
    data: {
      title,
      description,
      assigneeId,
      status,
      dueDate: dueRaw ? new Date(dueRaw) : null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  revalidatePath(`/projects/${task.projectId}`);
}

export async function setTaskStatusAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  if (!id || !["TODO", "IN_PROGRESS", "DONE"].includes(statusRaw)) return;

  const task = await prisma.task.update({
    where: { id },
    data: { status: statusRaw as TaskStatus },
  });

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  revalidatePath(`/projects/${task.projectId}`);
}
