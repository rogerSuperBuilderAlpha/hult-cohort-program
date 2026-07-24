"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeRedirectPath(String(formData.get("next") || "/"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message || "google_failed")}`);
  }
  redirect(data.url);
}

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const next = safeRedirectPath(String(formData.get("next") || "/"));
  if (!email) {
    redirect("/login?error=missing_email");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}

/**
 * Localhost / demo password login (PRD Step 3) — uses seeded admin or DEV_ADMIN_* env.
 * Disabled unless NEXT_PUBLIC_ENABLE_DEV_LOGIN=true.
 */
export async function signInWithDevPassword(formData: FormData) {
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN !== "true") {
    redirect("/login?error=dev_login_disabled");
  }

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const next = safeRedirectPath(String(formData.get("next") || "/"));

  const expectedEmail = (
    process.env.DEV_ADMIN_EMAIL || "admin@conexus.local"
  ).toLowerCase();
  const expectedPassword = process.env.DEV_ADMIN_PASSWORD || "ConexusSeed!2026";

  if (email !== expectedEmail || password !== expectedPassword) {
    // Still try Supabase password auth for any seeded cohort email when password matches seed.
    // Restrict to known seed domain for safety.
    if (!email.endsWith("@conexus.local") || password !== "ConexusSeed!2026") {
      redirect("/login?error=invalid_credentials");
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    redirect(
      `/login?error=${encodeURIComponent(error?.message || "invalid_credentials")}`,
    );
  }

  const result = await ensureProfileForUser({
    id: data.user.id,
    email: data.user.email,
    fullName:
      (data.user.user_metadata?.display_name as string | undefined) ||
      (data.user.user_metadata?.full_name as string | undefined) ||
      null,
    avatarUrl: null,
  });

  if (!result.ok) {
    await supabase.auth.signOut();
    redirect(`/login?error=${result.reason}`);
  }

  redirect(next);
}
