"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  profileFormSchema,
  profilePublishSchema,
} from "@/lib/validation/profile-project";
import type { ProfileStatus } from "@/lib/types/profile";

export type ProfileActionState = {
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

export async function saveProfileAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const { user } = await requireUser();

  const parsed = profileFormSchema.safeParse({
    name: String(formData.get("name") || ""),
    biography: String(formData.get("biography") || ""),
    location: String(formData.get("location") || ""),
    skills: parseJsonArray(formData.get("skills")),
    interests: parseJsonArray(formData.get("interests")),
    website_url: String(formData.get("website_url") || ""),
    github_profile_url: String(formData.get("github_profile_url") || ""),
    linkedin: String(formData.get("linkedin") || ""),
    x: String(formData.get("x") || ""),
    instagram: String(formData.get("instagram") || ""),
    youtube: String(formData.get("youtube") || ""),
    visible_to_partners: formData.get("visible_to_partners") === "on",
    avatar_url: (() => {
      const v = String(formData.get("avatar_url") || "").trim();
      return v === "" ? null : v;
    })(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile." };
  }

  const data = parsed.data;
  const social_links = {
    linkedin: data.linkedin ?? undefined,
    x: data.x ?? undefined,
    instagram: data.instagram ?? undefined,
    youtube: data.youtube ?? undefined,
  };
  // Drop empty keys
  for (const key of Object.keys(social_links) as (keyof typeof social_links)[]) {
    if (!social_links[key]) delete social_links[key];
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      name: data.name,
      biography: data.biography ?? null,
      location: data.location ?? null,
      skills: data.skills,
      interests: data.interests,
      website_url: data.website_url ?? null,
      github_profile_url: data.github_profile_url ?? null,
      social_links,
      visible_to_partners: data.visible_to_partners,
      avatar_url: data.avatar_url ?? null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/builders");
  return { success: "Profile saved." };
}

export async function setProfileStatusAction(
  status: Extract<ProfileStatus, "published" | "unpublished">,
): Promise<ProfileActionState> {
  const { user, profile } = await requireUser();

  if (status === "published") {
    const check = profilePublishSchema.safeParse({
      name: profile.name ?? "",
      biography: profile.biography ?? "",
      location: profile.location ?? "",
      skills: profile.skills ?? [],
      interests: profile.interests ?? [],
      website_url: profile.website_url ?? "",
      github_profile_url: profile.github_profile_url ?? "",
      linkedin: (profile.social_links?.linkedin as string) ?? "",
      x: (profile.social_links?.x as string) ?? "",
      instagram: (profile.social_links?.instagram as string) ?? "",
      youtube: (profile.social_links?.youtube as string) ?? "",
      visible_to_partners: profile.visible_to_partners,
      avatar_url: profile.avatar_url,
    });
    if (!check.success) {
      return {
        error:
          (check.error.issues[0]?.message ?? "Cannot publish yet.") +
          " Save your profile first, then publish.",
      };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ profile_status: status })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/profile");
  revalidatePath("/builders");
  return {
    success:
      status === "published"
        ? "Profile published."
        : "Profile unpublished.",
  };
}
