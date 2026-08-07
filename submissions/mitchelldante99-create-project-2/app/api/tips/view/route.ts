import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { LUDWITT } from "@/lib/ludwitt";

// Records that a user viewed a tip. This is the app's core "event" —
// each call writes one document to the hosted `progress` collection,
// which is what proves events are landing on the platform.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { tipId } = await req.json();
  if (!tipId || typeof tipId !== "string") {
    return NextResponse.json({ error: "missing_tip_id" }, { status: 400 });
  }

  const docId = `${session.user.sub}-${tipId}`;
  const viewedAt = new Date().toISOString();

  const res = await fetch(LUDWITT.dataUrl("progress", docId), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        user_id: session.user.sub,
        tip_id: tipId,
        viewed_at: viewedAt,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Ludwitt progress write failed:", res.status, body);
    return NextResponse.json({ error: "write_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, tipId, viewedAt });
}
