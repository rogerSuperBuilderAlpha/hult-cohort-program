import { NextResponse } from "next/server";
import { parseInitiativeTasks, type AllInitiativeTasks } from "@/lib/initiativeTasks";
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
      USER_DATA_KEYS.initiativeTasks,
      parseInitiativeTasks
    );

    let tasks: AllInitiativeTasks = record?.parsed ?? {};

    if (record?.hasRow && Object.keys(tasks).length === 0 && record.raw) {
      tasks = parseInitiativeTasks(record.raw);
    }

    return NextResponse.json({
      tasks,
      hasRow: Boolean(record?.hasRow),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load tasks.";
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
    const tasks = parseInitiativeTasks(body);

    await upsertUserAppData(
      supabase,
      user.id,
      USER_DATA_KEYS.initiativeTasks,
      tasks
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save tasks.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
