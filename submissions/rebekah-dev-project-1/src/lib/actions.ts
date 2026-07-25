"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, TaskPriority, TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { currentUser, signIn } from "@/lib/auth";

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export type FormState = { error?: string };

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, password } = parsed.data;
  try {
    await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "An account with that email already exists — sign in instead." };
    }
    throw e;
  }
  redirect("/signin?registered=1");
}

async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/signin");
  return user;
}

const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(100),
  description: z.string().trim().max(500).optional(),
  dueDate: z.string().optional(),
});

export async function createProjectAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });
  if (!parsed.success) return;
  const { name, description, dueDate } = parsed.data;
  const project = await prisma.project.create({
    data: {
      name,
      description: description || null,
      dueDate: dueDate ? new Date(dueDate + "T23:59:59Z") : null,
      ownerId: user.id,
      members: { create: { userId: user.id } },
    },
  });
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function joinProjectAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const projectId = String(formData.get("projectId") ?? "");
  if (!projectId) return;
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId: user.id } },
    update: {},
    create: { projectId, userId: user.id },
  });
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

const taskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(1, "Task title is required").max(140),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.string().optional(),
});

async function requireMembership(projectId: string, userId: string) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member) redirect("/projects");
}

export async function createTaskAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = taskSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    priority: formData.get("priority") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });
  if (!parsed.success) return;
  const { projectId, title, priority, dueDate } = parsed.data;
  await requireMembership(projectId, user.id);
  await prisma.task.create({
    data: {
      projectId,
      title,
      priority,
      dueDate: dueDate ? new Date(dueDate + "T23:59:59Z") : null,
      createdById: user.id,
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function setTaskStatusAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!taskId || !(status in TaskStatus)) return;
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return;
  await requireMembership(task.projectId, user.id);
  const nextStatus = status as TaskStatus;
  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: nextStatus,
      completedAt: nextStatus === TaskStatus.DONE ? new Date() : null,
      // Shipping a task you picked up counts as yours: claim it if unassigned.
      assigneeId: task.assigneeId ?? (nextStatus === TaskStatus.DONE ? user.id : task.assigneeId),
    },
  });
  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/dashboard");
}

export async function claimTaskAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");
  if (!taskId) return;
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return;
  await requireMembership(task.projectId, user.id);
  await prisma.task.update({
    where: { id: taskId },
    data: { assigneeId: task.assigneeId === user.id ? null : user.id },
  });
  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");
  if (!taskId) return;
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { select: { ownerId: true } } },
  });
  if (!task) return;
  if (task.createdById !== user.id && task.project.ownerId !== user.id) return;
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/dashboard");
}

export async function signInWithCredentials(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    return {};
  } catch (e) {
    // next-auth signals both auth failures and the success redirect via
    // thrown errors; rethrow the redirect so Next.js can complete it.
    if (e && typeof e === "object" && "digest" in e && String((e as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")) {
      throw e;
    }
    return { error: "Invalid email or password." };
  }
}
