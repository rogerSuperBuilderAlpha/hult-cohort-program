import { NextResponse } from "next/server";
import { ludwittConfig } from "@/lib/ludwitt";
import { writeDevBypassSession } from "@/lib/session";

/** Local-only helper so you can walk the course before Ludwitt keys exist. */
export async function POST() {
  if (!ludwittConfig().allowDevBypass) {
    return NextResponse.json(
      { error: "Dev bypass disabled. Launch from Ludwitt/Hult." },
      { status: 403 },
    );
  }

  await writeDevBypassSession();
  return NextResponse.json({ ok: true });
}
