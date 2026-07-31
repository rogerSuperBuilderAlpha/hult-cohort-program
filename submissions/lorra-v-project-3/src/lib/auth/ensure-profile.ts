import "server-only";

import { isAdminEmail } from "@/lib/auth/admin-emails";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile, UserRole } from "@/lib/types/profile";

export type EnsureProfileResult =
  | { ok: true; profile: Profile; isNew: boolean }
  | { ok: false; reason: "missing_email" };

/**
 * Create or refresh the profiles row for an authenticated user.
 * Admin role is granted only when email is in ADMIN_EMAILS — re-evaluated
 * on every call so removing an email demotes on next login/visit.
 */
export async function ensureProfileForUser(input: {
  id: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
}): Promise<EnsureProfileResult> {
  const email = input.email?.trim().toLowerCase() || "";
  if (!email) return { ok: false, reason: "missing_email" };

  const admin = createAdminClient();

  const { data: existing, error: existingError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", input.id)
    .maybeSingle();

  if (existingError) throw existingError;

  const role: UserRole = isAdminEmail(email) ? "admin" : "participant";
  const name =
    input.name?.trim() ||
    (existing?.name as string | null | undefined) ||
    email.split("@")[0] ||
    "Builder";

  const payload = {
    id: input.id,
    email,
    name,
    role,
    avatar_url:
      input.avatarUrl ??
      (existing?.avatar_url as string | null | undefined) ??
      null,
  };

  if (!existing) {
    const { data, error } = await admin
      .from("profiles")
      .insert({
        ...payload,
        profile_status: "incomplete",
        skills: [],
        interests: [],
        social_links: {},
        visible_to_partners: true,
      })
      .select("*")
      .single();

    if (error) throw error;
    return { ok: true, profile: data as Profile, isNew: true };
  }

  const { data, error } = await admin
    .from("profiles")
    .update(payload)
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) throw error;
  return { ok: true, profile: data as Profile, isNew: false };
}
