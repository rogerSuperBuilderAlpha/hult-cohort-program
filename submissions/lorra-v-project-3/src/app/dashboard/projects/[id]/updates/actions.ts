"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { projectUpdateFormSchema } from "@/lib/validation/project-update";

export type UpdateActionState = {
  error?: string;
  success?: string;
} | null;

function parseJsonArray(raw: FormDataEntryValue | null): string[] {
  if (!raw || typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

async function assertOwnsProject(projectId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, owner_id")
    .eq("id", projectId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as { id: string; slug: string; owner_id: string } | null;
}

export async function createProjectUpdateAction(
  projectId: string,
  _prev: UpdateActionState,
  formData: FormData,
): Promise<UpdateActionState> {
  const { user } = await requireUser();
  const project = await assertOwnsProject(projectId, user.id);
  if (!project) return { error: "Project not found." };

  const parsed = projectUpdateFormSchema.safeParse({
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    achievements: parseJsonArray(formData.get("achievements")),
    challenges: parseJsonArray(formData.get("challenges")),
    lessons: parseJsonArray(formData.get("lessons")),
    next_steps: parseJsonArray(formData.get("next_steps")),
    evidence_links: parseJsonArray(formData.get("evidence_links")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid update." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("project_updates").insert({
    project_id: projectId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    achievements: parsed.data.achievements,
    challenges: parsed.data.challenges,
    lessons: parsed.data.lessons,
    next_steps: parsed.data.next_steps,
    evidence_links: parsed.data.evidence_links,
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}/updates`);
  revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/projects");
  redirect(`/dashboard/projects/${projectId}/updates`);
}

export async function deleteProjectUpdateAction(
  projectId: string,
  updateId: string,
): Promise<UpdateActionState> {
  const { user } = await requireUser();
  const project = await assertOwnsProject(projectId, user.id);
  if (!project) return { error: "Project not found." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("project_updates")
    .delete()
    .eq("id", updateId)
    .eq("project_id", projectId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${projectId}/updates`);
  revalidatePath(`/projects/${project.slug}`);
  return { success: "Update deleted." };
}
