import { isAdminEmail } from "@/lib/auth/admin-emails";
import { createServiceClient } from "@/lib/supabase/admin";

export type EnsureProfileResult =
  | { ok: true; profileId: string; isNew: boolean }
  | { ok: false; reason: "deactivated" | "missing_email" };

/**
 * First-login bootstrap (PRD §2):
 * - open self-serve signup — any authenticated user becomes a member
 * - default role is member; admin is only via ADMIN_EMAILS or prior admin profile
 * - join default public channels
 * - block deactivated users
 */
export async function ensureProfileForUser(input: {
  id: string;
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
}): Promise<EnsureProfileResult> {
  const email = input.email?.trim().toLowerCase() || "";
  if (!email) return { ok: false, reason: "missing_email" };

  const admin = createServiceClient();

  const { data: existing } = await admin
    .from("profiles")
    .select("id, status, role, display_name")
    .eq("id", input.id)
    .maybeSingle();

  if (existing?.status === "deactivated") {
    return { ok: false, reason: "deactivated" };
  }

  const displayName =
    input.fullName?.trim() ||
    existing?.display_name ||
    email.split("@")[0];

  // Self-serve signup → member. Admin is not granted by signup.
  const role =
    existing?.role === "admin" || isAdminEmail(email) ? "admin" : "member";

  const { error: upsertErr } = await admin.from("profiles").upsert(
    {
      id: input.id,
      email,
      display_name: displayName,
      avatar_url: input.avatarUrl ?? null,
      role,
      status: "active",
    },
    { onConflict: "id" },
  );
  if (upsertErr) throw upsertErr;

  const { data: publicChannels } = await admin
    .from("channels")
    .select("id")
    .eq("type", "public")
    .eq("is_archived", false);

  if (publicChannels?.length) {
    const rows = publicChannels.map((ch) => ({
      channel_id: ch.id,
      user_id: input.id,
      notification_level: "all" as const,
    }));
    await admin.from("channel_members").upsert(rows, {
      onConflict: "channel_id,user_id",
    });
  }

  return { ok: true, profileId: input.id, isNew: !existing };
}
