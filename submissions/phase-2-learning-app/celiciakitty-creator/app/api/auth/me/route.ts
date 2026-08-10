import { NextResponse } from "next/server";

import { isLudwittConfigured } from "@/lib/ludwitt/config";
import { getPublicLudwittUser } from "@/lib/ludwitt/session";

export async function GET() {
  const configured = isLudwittConfigured();

  if (!configured) {
    return NextResponse.json({
      configured: false,
      authenticated: false,
      user: null,
    });
  }

  const user = await getPublicLudwittUser();

  if (!user) {
    return NextResponse.json({
      configured: true,
      authenticated: false,
      user: null,
    });
  }

  return NextResponse.json({ configured: true, authenticated: true, user });
}
