import { NextResponse } from "next/server";
import {
  getSiteUrl,
  getSupabaseAnonKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseAnonKey();
  const siteUrl = getSiteUrl();

  let urlHost = "";
  let urlValid = false;

  try {
    if (supabaseUrl) {
      const parsed = new URL(supabaseUrl);
      urlHost = parsed.host;
      urlValid =
        parsed.protocol === "https:" && parsed.host.endsWith(".supabase.co");
    }
  } catch {
    urlValid = false;
  }

  let supabaseReachable = false;
  let supabasePingStatus: number | null = null;
  let supabasePingError: string | null = null;

  if (urlValid && supabaseKey.length > 20) {
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
        headers: { apikey: supabaseKey },
        cache: "no-store",
      });
      supabasePingStatus = response.status;
      // Any HTTP response means the host is reachable (401/500 still prove DNS + TLS work).
      supabaseReachable = true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Ping failed.");
      const cause =
        error.cause instanceof Error ? error.cause.message : null;
      supabasePingError = cause
        ? `${error.message} (${cause})`
        : error.message;
    }
  }

  const configOk = urlValid && supabaseKey.length > 20;

  return NextResponse.json({
    ok: configOk && supabaseReachable,
    configOk,
    supabaseReachable,
    supabasePingStatus,
    supabasePingError,
    supabaseUrlConfigured: Boolean(supabaseUrl),
    supabaseUrlValid: urlValid,
    supabaseUrlHost: urlHost || null,
    supabaseKeyConfigured: supabaseKey.length > 20,
    siteUrlConfigured: Boolean(siteUrl),
    siteUrl: siteUrl || null,
  });
}
