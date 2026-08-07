import { NextResponse } from "next/server";
import { TIPS } from "@/lib/tips";
import { getSession } from "@/lib/session";
import { LUDWITT } from "@/lib/ludwitt";

export async function GET() {
  const session = await getSession();

  // Tips themselves are static and public — no auth required to browse them.
  // If signed in, also return which tips this user has already viewed.
  let viewedTipIds: string[] = [];

  if (session) {
    const res = await fetch(
      `${LUDWITT.dataUrl("progress")}?where=user_id:${session.user.sub}`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );
    if (res.ok) {
      const json = await res.json();
      viewedTipIds = (json.documents || []).map((d: { data: { tip_id: string } }) => d.data.tip_id);
    }
  }

  return NextResponse.json({ tips: TIPS, viewedTipIds, signedIn: !!session });
}
