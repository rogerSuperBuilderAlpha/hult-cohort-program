import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/app-config";
import { LudwittApiError } from "@/lib/ludwitt/client";
import { LUDWITT_COLLECTIONS } from "@/lib/ludwitt/collections";
import { listDocuments } from "@/lib/ludwitt/data";
import { localListEvents, localListSessions } from "@/lib/local-store";
import { requireSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await requireSession();

    if (session.demo || isDemoMode()) {
      const sub = session.user.sub;
      return NextResponse.json({
        events: localListEvents(sub, 25),
        sessions: localListSessions(sub, 15),
        demo: true,
      });
    }

    const events = await listDocuments(
      session.accessToken,
      LUDWITT_COLLECTIONS.events,
      {
        limit: 25,
        orderBy: "-createdAt",
      },
    );
    const sessions = await listDocuments(
      session.accessToken,
      LUDWITT_COLLECTIONS.sessions,
      {
        limit: 15,
        orderBy: "-createdAt",
      },
    );

    return NextResponse.json({ events, sessions, demo: false });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof LudwittApiError) {
      return NextResponse.json(
        { error: error.error, message: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
