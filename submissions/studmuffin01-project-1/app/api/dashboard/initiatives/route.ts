import { NextResponse } from "next/server";
import { normalizeCustomInitiatives, type Initiative } from "@/lib/initiatives";
import { createClient } from "@/lib/supabase/server";
import { fetchCustomInitiatives } from "@/lib/supabase/initiativesRepository";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const initiatives: Initiative[] = normalizeCustomInitiatives(
      await fetchCustomInitiatives(supabase, user.id)
    );

    return NextResponse.json({ initiatives });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load initiatives.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
