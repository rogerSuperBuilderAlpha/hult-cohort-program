import { NextResponse } from "next/server";
import {
  normalizeCustomInitiatives,
  sanitizeInitiativeTitle,
  type Initiative,
} from "@/lib/initiatives";
import { createClient } from "@/lib/supabase/server";
import {
  fetchCustomInitiatives,
  updateCustomInitiative,
} from "@/lib/supabase/initiativesRepository";

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

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = (await request.json()) as {
      slug?: string;
      title?: string;
      archived?: boolean;
    };

    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    if (!slug) {
      return NextResponse.json({ error: "Missing initiative slug." }, { status: 400 });
    }

    const updates: { title?: string; archived?: boolean } = {};

    if (typeof body.title === "string") {
      const title = sanitizeInitiativeTitle(body.title);
      if (!title) {
        return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
      }
      updates.title = title;
    }

    if (typeof body.archived === "boolean") {
      updates.archived = body.archived;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates provided." }, { status: 400 });
    }

    await updateCustomInitiative(supabase, user.id, slug, updates);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update initiative.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
