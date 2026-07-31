import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

function appOrigin(request: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));
  const origin = appOrigin(request);

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message || "auth_failed")}`,
    );
  }

  const result = await ensureProfileForUser({
    id: data.user.id,
    email: data.user.email,
    name:
      (data.user.user_metadata?.name as string | undefined) ||
      (data.user.user_metadata?.full_name as string | undefined) ||
      null,
    avatarUrl: (data.user.user_metadata?.avatar_url as string | undefined) || null,
  });

  if (!result.ok) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=${result.reason}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
