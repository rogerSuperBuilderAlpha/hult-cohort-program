import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  let urlHost = "";
  let urlValid = false;

  try {
    if (supabaseUrl) {
      const parsed = new URL(supabaseUrl);
      urlHost = parsed.host;
      urlValid = parsed.protocol === "https:" && parsed.host.endsWith(".supabase.co");
    }
  } catch {
    urlValid = false;
  }

  return NextResponse.json({
    ok: urlValid && supabaseKey.length > 20,
    supabaseUrlConfigured: Boolean(supabaseUrl),
    supabaseUrlValid: urlValid,
    supabaseUrlHost: urlHost || null,
    supabaseKeyConfigured: supabaseKey.length > 20,
    siteUrlConfigured: Boolean(siteUrl),
    siteUrl: siteUrl || null,
  });
}
