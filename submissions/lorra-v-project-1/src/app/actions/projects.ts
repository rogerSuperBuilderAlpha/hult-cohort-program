"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name) {
    redirect("/projects?error=" + encodeURIComponent("Project name is required."));
  }

  const { error } = await supabase.from("projects").insert({
    owner_id: user.id,
    name,
    description,
    status: "active",
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect(`/projects?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/projects");
  revalidatePath("/tasks");
  revalidatePath("/admin");
  redirect("/projects?ok=created");
}

export async function updateProject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const projectId = String(formData.get("project_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!projectId || !name) {
    redirect("/projects?error=" + encodeURIComponent("Project id and name are required."));
  }

  const { error } = await supabase
    .from("projects")
    .update({
      name,
      description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) {
    redirect(`/projects?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/projects");
  revalidatePath("/tasks");
  redirect("/projects?ok=updated");
}

export async function archiveProject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const projectId = String(formData.get("project_id") ?? "").trim();
  if (!projectId) {
    redirect("/projects?error=" + encodeURIComponent("Project id is required."));
  }

  const { error } = await supabase
    .from("projects")
    .update({
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) {
    redirect(`/projects?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/projects");
  revalidatePath("/tasks");
  revalidatePath("/admin");
  redirect("/projects?ok=archived");
}
