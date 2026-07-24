import { createServiceClient } from "@/lib/supabase/admin";

export type EnsureProfileResult =
  | { ok: true; profileId: string; isNew: boolean }
  | { ok: false; reason: "not_allowlisted" | "deactivated" | "missing_email" };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * First-login bootstrap (PRD §2):
 * - enforce roster allowlist (plus optional AUTH_ALLOWLIST_FALLBACK)
 * - upsert profiles row
 * - join default public channels
 * - block deactivated users
 */
export async function ensureProfileForUser(input: {
  id: string;
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
}): Promise<EnsureProfileResult> {
  const email = input.email ? normalizeEmail(input.email) : "";
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

  const fallback = (process.env.AUTH_ALLOWLIST_FALLBACK ?? "")
    .split(",")
    .map((e) => normalizeEmail(e))
    .filter(Boolean);

  const { data: roster } = await admin
    .from("roster_allowlist")
    .select("email, display_name")
    .eq("email", email)
    .maybeSingle();

  const allowlisted = Boolean(roster) || fallback.includes(email) || existing?.role === "admin";

  if (!allowlisted) {
    return { ok: false, reason: "not_allowlisted" };
  }

  const displayName =
    roster?.display_name ||
    input.fullName?.trim() ||
    existing?.display_name ||
    email.split("@")[0];

  const { error: upsertErr } = await admin.from("profiles").upsert(
    {
      id: input.id,
      email,
      display_name: displayName,
      avatar_url: input.avatarUrl ?? null,
      role: existing?.role ?? "member",
      status: "active",
    },
    { onConflict: "id" },
  );
  if (upsertErr) throw upsertErr;

  // Ensure email is on roster for future sign-ins (Google/magic-link)
  await admin.from("roster_allowlist").upsert(
    { email, display_name: displayName },
    { onConflict: "email" },
  );

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
