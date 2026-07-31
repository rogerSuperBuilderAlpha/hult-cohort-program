"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import { friendlyAuthError } from "@/lib/auth/errors";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { loginSchema, signupSchema } from "@/lib/auth/schemas";

export type AuthActionState = {
  error?: string;
  success?: string;
} | null;

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") || "")
      .trim()
      .toLowerCase(),
    password: String(formData.get("password") || ""),
    next: String(formData.get("next") || "/dashboard"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form." };
  }

  const next = safeRedirectPath(parsed.data.next);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { error: friendlyAuthError(error?.message) };
  }

  const result = await ensureProfileForUser({
    id: data.user.id,
    email: data.user.email,
    name:
      (data.user.user_metadata?.name as string | undefined) ||
      (data.user.user_metadata?.full_name as string | undefined) ||
      null,
  });

  if (!result.ok) {
    await supabase.auth.signOut();
    return { error: friendlyAuthError(result.reason) };
  }

  redirect(next);
}

export async function signupAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || "")
      .trim()
      .toLowerCase(),
    password: String(formData.get("password") || ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  // Email confirmation disabled → session present; bootstrap profile now.
  if (data.user && data.session) {
    const result = await ensureProfileForUser({
      id: data.user.id,
      email: data.user.email,
      name: parsed.data.name,
    });

    if (!result.ok) {
      await supabase.auth.signOut();
      return { error: friendlyAuthError(result.reason) };
    }

    redirect("/dashboard");
  }

  // Email confirmation required.
  return {
    success:
      "Account created. Check your email for a confirmation link, then log in.",
  };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
