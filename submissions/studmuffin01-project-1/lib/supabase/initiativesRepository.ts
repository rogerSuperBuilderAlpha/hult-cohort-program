import type { SupabaseClient } from "@supabase/supabase-js";
import type { Initiative } from "@/lib/initiatives";

export async function fetchCustomInitiatives(
  supabase: SupabaseClient,
  userId: string
): Promise<Initiative[]> {
  const { data, error } = await supabase
    .from("custom_initiatives")
    .select("slug, title, deadline")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    slug: row.slug,
    title: row.title,
    deadline: row.deadline,
  }));
}

export async function insertCustomInitiative(
  supabase: SupabaseClient,
  userId: string,
  initiative: Initiative
): Promise<void> {
  const { error } = await supabase.from("custom_initiatives").insert({
    user_id: userId,
    slug: initiative.slug,
    title: initiative.title,
    deadline: initiative.deadline,
  });

  if (error) {
    throw error;
  }
}

export async function deleteCustomInitiative(
  supabase: SupabaseClient,
  userId: string,
  slug: string
): Promise<void> {
  const { error } = await supabase
    .from("custom_initiatives")
    .delete()
    .eq("user_id", userId)
    .eq("slug", slug);

  if (error) {
    throw error;
  }
}

export async function replaceCustomInitiatives(
  supabase: SupabaseClient,
  userId: string,
  initiatives: Initiative[]
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("custom_initiatives")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw deleteError;
  }

  if (initiatives.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from("custom_initiatives").insert(
    initiatives.map((initiative) => ({
      user_id: userId,
      slug: initiative.slug,
      title: initiative.title,
      deadline: initiative.deadline,
    }))
  );

  if (insertError) {
    throw insertError;
  }
}
