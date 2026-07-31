"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getDefaultCohortId } from "@/lib/cohort";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import {
  formatZodError,
  projectFormSchema,
  projectPublishSchema,
} from "@/lib/validation/profile-project";
import type { ProjectStatus } from "@/lib/types/project";

export type ProjectActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
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

function formToProjectInput(formData: FormData) {
  const name = String(formData.get("name") || "");
  const slugRaw = String(formData.get("slug") || "").trim();
  return {
    name,
    slug: slugRaw || slugify(name),
    tagline: String(formData.get("tagline") || ""),
    summary: String(formData.get("summary") || ""),
    description: String(formData.get("description") || ""),
    problem: String(formData.get("problem") || ""),
    solution: String(formData.get("solution") || ""),
    target_audience: String(formData.get("target_audience") || ""),
    technology_stack: parseJsonArray(formData.get("technology_stack")),
    stage: String(formData.get("stage") || "idea"),
    live_url: String(formData.get("live_url") || ""),
    github_url: String(formData.get("github_url") || ""),
    demo_url: String(formData.get("demo_url") || ""),
    image_url: (() => {
      const v = String(formData.get("image_url") || "").trim();
      return v === "" ? null : v;
    })(),
    needs: parseJsonArray(formData.get("needs")),
    sectors: parseJsonArray(formData.get("sectors")),
  };
}

async function assertSlugAvailable(
  cohortId: string,
  slug: string,
  excludeId?: string,
): Promise<string | null> {
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select("id")
    .eq("cohort_id", cohortId)
    .eq("slug", slug)
    .limit(1);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) return error.message;
  if (data) return "That slug is already taken in this cohort. Try another.";
  return null;
}

export async function createProjectAction(
  _prev: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const { user } = await requireUser();
  const parsed = projectFormSchema.safeParse(formToProjectInput(formData));
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  const cohortId = await getDefaultCohortId();
  const slugConflict = await assertSlugAvailable(cohortId, parsed.data.slug);
  if (slugConflict) return { error: slugConflict };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      cohort_id: cohortId,
      owner_id: user.id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      tagline: parsed.data.tagline ?? null,
      summary: parsed.data.summary ?? null,
      description: parsed.data.description ?? null,
      problem: parsed.data.problem ?? null,
      solution: parsed.data.solution ?? null,
      target_audience: parsed.data.target_audience ?? null,
      technology_stack: parsed.data.technology_stack,
      stage: parsed.data.stage,
      live_url: parsed.data.live_url ?? null,
      github_url: parsed.data.github_url ?? null,
      demo_url: parsed.data.demo_url ?? null,
      image_url: parsed.data.image_url ?? null,
      needs: parsed.data.needs,
      sectors: parsed.data.sectors,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/projects");
  revalidatePath("/projects");
  redirect(`/dashboard/projects/${data.id}`);
}

export async function updateProjectAction(
  projectId: string,
  _prev: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const { user } = await requireUser();
  const parsed = projectFormSchema.safeParse(formToProjectInput(formData));
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("projects")
    .select("id, cohort_id, owner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (existingError) return { error: existingError.message };
  if (!existing || existing.owner_id !== user.id) {
    return { error: "Project not found." };
  }

  const slugConflict = await assertSlugAvailable(
    existing.cohort_id as string,
    parsed.data.slug,
    projectId,
  );
  if (slugConflict) return { error: slugConflict };

  const { error } = await supabase
    .from("projects")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      tagline: parsed.data.tagline ?? null,
      summary: parsed.data.summary ?? null,
      description: parsed.data.description ?? null,
      problem: parsed.data.problem ?? null,
      solution: parsed.data.solution ?? null,
      target_audience: parsed.data.target_audience ?? null,
      technology_stack: parsed.data.technology_stack,
      stage: parsed.data.stage,
      live_url: parsed.data.live_url ?? null,
      github_url: parsed.data.github_url ?? null,
      demo_url: parsed.data.demo_url ?? null,
      image_url: parsed.data.image_url ?? null,
      needs: parsed.data.needs,
      sectors: parsed.data.sectors,
    })
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath(`/projects/${parsed.data.slug}`);
  return { success: "Project saved." };
}

export async function setProjectStatusAction(
  projectId: string,
  status: Extract<ProjectStatus, "published" | "unpublished" | "draft">,
): Promise<ProjectActionState> {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!project) return { error: "Project not found." };

  if (status === "published") {
    const check = projectPublishSchema.safeParse({
      name: project.name,
      slug: project.slug,
      tagline: project.tagline ?? "",
      summary: project.summary ?? "",
      description: project.description ?? "",
      problem: project.problem ?? "",
      solution: project.solution ?? "",
      target_audience: project.target_audience ?? "",
      technology_stack: project.technology_stack ?? [],
      stage: project.stage,
      live_url: project.live_url ?? "",
      github_url: project.github_url ?? "",
      demo_url: project.demo_url ?? "",
      image_url: project.image_url,
      needs: project.needs ?? [],
      sectors: project.sectors ?? [],
    });
    if (!check.success) {
      return {
        error: `${formatZodError(check.error)} Save the project first if you just edited the form, then publish.`,
      };
    }
  }

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  return {
    success:
      status === "published"
        ? "Project published."
        : status === "unpublished"
          ? "Project unpublished."
          : "Project set to draft.",
  };
}

export async function deleteProjectAction(
  projectId: string,
): Promise<ProjectActionState> {
  const { user } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/projects");
  revalidatePath("/projects");
  redirect("/dashboard/projects");
}
