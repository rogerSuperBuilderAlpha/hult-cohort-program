import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const message = error.message.toLowerCase().includes("fetch failed")
        ? "Cannot reach Supabase from the server. Open /api/health — if supabaseReachable is false, restore your Supabase project (Dashboard → Project Settings) or fix NEXT_PUBLIC_SUPABASE_URL, then redeploy."
        : error.message;
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
