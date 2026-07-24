import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Dev/schema probe for Step 2 smoke tests.
 * Uses service role — never expose sensitive data; counts only.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase env vars" },
      { status: 500 },
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const tables = [
    "profiles",
    "workspaces",
    "channels",
    "channel_members",
    "conversations",
    "conversation_members",
    "messages",
    "reactions",
    "attachments",
    "mentions",
    "ticket_links",
    "notifications",
    "integration_configs",
    "roster_allowlist",
  ] as const;

  const counts: Record<string, number | null> = {};
  const missing: string[] = [];

  for (const table of tables) {
    const { count, error } = await admin
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) {
      missing.push(table);
      counts[table] = null;
    } else {
      counts[table] = count ?? 0;
    }
  }

  const ok =
    missing.length === 0 &&
    (counts.profiles ?? 0) >= 10 &&
    (counts.channels ?? 0) >= 3 &&
    (counts.workspaces ?? 0) >= 1;

  return NextResponse.json(
    {
      ok,
      missing,
      counts,
      rlsExpected: true,
    },
    { status: ok ? 200 : 503 },
  );
}
