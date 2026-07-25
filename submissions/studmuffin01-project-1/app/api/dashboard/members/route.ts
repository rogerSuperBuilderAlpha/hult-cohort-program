import { NextResponse } from "next/server";
import { parseTeamMembers, type TeamMember } from "@/lib/teamMembers";
import { createClient } from "@/lib/supabase/server";
import {
  fetchUserAppDataRecord,
  upsertUserAppData,
  USER_DATA_KEYS,
} from "@/lib/supabase/userDataRepository";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const record = await fetchUserAppDataRecord(
      supabase,
      user.id,
      USER_DATA_KEYS.teamMembers,
      parseTeamMembers
    );

    const members: TeamMember[] = record?.parsed ?? [];

    return NextResponse.json({
      members,
      hasRow: Boolean(record?.hasRow),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load team members.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json();
    const members = parseTeamMembers(body);

    await upsertUserAppData(supabase, user.id, USER_DATA_KEYS.teamMembers, members);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save team members.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
