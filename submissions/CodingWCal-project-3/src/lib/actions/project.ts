"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/db";
import { projectSchema } from "@/lib/validations/project";
import { auth } from "@/lib/auth/config";
import { slugify } from "@/lib/utils/slugify";

async function requireEditor() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const editor = await prisma.editor.findFirst({
    where: { userId: session.user.id },
  });

  if (!editor) {
    throw new Error("Not an editor");
  }

  return editor;
}

type ActionResult = { error?: Record<string, string[] | undefined> } | null;

function parseFormData(formData: FormData) {
  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "featured") {
      raw[key] = value === "on";
    } else if (key === "memberIds") {
      if (!raw[key]) raw[key] = [];
      (raw[key] as string[]).push(value as string);
    } else {
      raw[key] = value;
    }
  });
  return raw;
}

export async function createProject(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const editor = await requireEditor().catch(() => null);
  if (!editor) return null;

  const raw = parseFormData(formData);
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const finalSlug = (data.slug || slugify(data.title)).slice(0, 120);
  const techStackArray = data.techStack
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const techStackJson = JSON.stringify(techStackArray);

  await prisma.project.create({
    data: {
      title: data.title,
      slug: finalSlug,
      description: data.description,
      coverImage: data.coverImage || null,
      techStack: techStackJson,
      githubUrl: data.githubUrl || null,
      liveUrl: data.liveUrl || null,
      featured: data.featured,
      members: {
        create: data.memberIds.map((memberId) => ({ memberId })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateProject(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const editor = await requireEditor().catch(() => null);
  if (!editor) return null;

  const slug = formData.get("_slug") as string;
  if (!slug) return null;

  const existing = await prisma.project.findUnique({ where: { slug } });
  if (!existing) return null;

  const raw = parseFormData(formData);
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const finalSlug = (data.slug || slugify(data.title)).slice(0, 120);
  const techStackArray = data.techStack
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const techStackJson = JSON.stringify(techStackArray);

  await prisma.projectMember.deleteMany({ where: { projectId: existing.id } });

  await prisma.project.update({
    where: { id: existing.id },
    data: {
      title: data.title,
      slug: finalSlug,
      description: data.description,
      coverImage: data.coverImage || null,
      techStack: techStackJson,
      githubUrl: data.githubUrl || null,
      liveUrl: data.liveUrl || null,
      featured: data.featured,
      members: {
        create: data.memberIds.map((memberId) => ({ memberId })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${finalSlug}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProject(slug: string) {
  const editor = await requireEditor().catch(() => null);
  if (!editor) redirect("/admin");

  await prisma.project.delete({ where: { slug } });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
  redirect("/admin");
}
