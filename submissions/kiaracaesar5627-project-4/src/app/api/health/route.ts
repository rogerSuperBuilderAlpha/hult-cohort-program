import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, service: "ludwitt-hult-api", host: "interview-room" });
}
