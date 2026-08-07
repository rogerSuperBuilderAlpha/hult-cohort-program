import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const apiUrl = process.env.LUDWITT_API_URL;
  const apiKey = process.env.LUDWITT_API_KEY;
  const appId = process.env.LUDWITT_APP_ID;

  if (!apiUrl || !apiKey || !appId) {
    return NextResponse.redirect(new URL("/?error=demo-off", req.url));
  }

  const user_id = `visitor_${crypto.randomUUID()}`;

  try {
    const res = await fetch(`${apiUrl}/auth/launch-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ app_id: appId, user_id, email: null }),
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/?error=demo-unavailable", req.url));
    }

    const { token } = (await res.json()) as { token?: string };
    if (!token) {
      return NextResponse.redirect(new URL("/?error=demo-unavailable", req.url));
    }

    const launch = new URL("/launch", req.url);
    launch.searchParams.set("token", token);
    return NextResponse.redirect(launch, 307);
  } catch {
    return NextResponse.redirect(new URL("/?error=demo-unavailable", req.url));
  }
}