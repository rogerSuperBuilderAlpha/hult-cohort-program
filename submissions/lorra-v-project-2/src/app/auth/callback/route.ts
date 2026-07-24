import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL || origin;

  if (!code) {
    return NextResponse.redirect(`${appOrigin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${appOrigin}/login?error=${encodeURIComponent(error?.message || "auth_failed")}`,
    );
  }

  const result = await ensureProfileForUser({
    id: data.user.id,
    email: data.user.email,
    fullName:
      (data.user.user_metadata?.full_name as string | undefined) ||
      (data.user.user_metadata?.display_name as string | undefined) ||
      null,
    avatarUrl: (data.user.user_metadata?.avatar_url as string | undefined) || null,
  });

  if (!result.ok) {
    await supabase.auth.signOut();
    const reason =
      result.reason === "deactivated"
        ? "deactivated"
        : result.reason === "missing_email"
          ? "missing_email"
          : "not_allowlisted";
    return NextResponse.redirect(`${appOrigin}/login?error=${reason}`);
  }

  return NextResponse.redirect(`${appOrigin}${next}`);
}
