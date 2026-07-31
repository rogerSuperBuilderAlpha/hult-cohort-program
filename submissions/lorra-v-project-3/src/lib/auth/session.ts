import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import type { Profile } from "@/lib/types/profile";
import type { User } from "@supabase/supabase-js";

export type SessionContext = {
  user: User;
  profile: Profile;
};

function nameFromUser(user: User): string | null {
  return (
    (user.user_metadata?.name as string | undefined) ||
    (user.user_metadata?.full_name as string | undefined) ||
    null
  );
}

export async function getSession(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const result = await ensureProfileForUser({
    id: user.id,
    email: user.email,
    name: nameFromUser(user),
    avatarUrl: (user.user_metadata?.avatar_url as string | undefined) || null,
  });

  if (!result.ok) {
    await supabase.auth.signOut();
    return null;
  }

  return { user, profile: result.profile };
}

export async function requireUser(
  redirectTo = "/login?next=/dashboard",
): Promise<SessionContext> {
  const session = await getSession();
  if (!session) redirect(redirectTo);
  return session;
}

export async function requireAdmin(
  redirectTo = "/dashboard",
): Promise<SessionContext> {
  const session = await requireUser("/login?next=/admin");
  if (session.profile.role !== "admin") redirect(redirectTo);
  return session;
}
