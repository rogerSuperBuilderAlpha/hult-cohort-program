import { NextResponse, type NextRequest } from "next/server";
import { verifyLaunchToken } from "@/lib/ludwitt/verifyLaunch";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

function rejectionResponse() {
  return new NextResponse("Launch from Ludwitt/Hult", {
    status: 401,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return rejectionResponse();
  }

  const verified = await verifyLaunchToken(token);
  if (!verified.ok) {
    return rejectionResponse();
  }

  const { sub, email } = verified.claims;

  let userId: string;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("app_users")
      .upsert(
        { ludwitt_sub: sub, email },
        { onConflict: "ludwitt_sub" },
      )
      .select("id")
      .single();

    if (error || !data?.id) {
      console.error("app_users upsert failed", error);
      return rejectionResponse();
    }
    userId = data.id;
  } catch (err) {
    console.error("launch upsert error", err);
    return rejectionResponse();
  }

  const sessionToken = await createSessionToken({
    userId,
    ludwittSub: sub,
    email,
  });

  const response = NextResponse.redirect(new URL("/paths", request.url));
  response.cookies.set(
    SESSION_COOKIE_NAME,
    sessionToken,
    sessionCookieOptions(),
  );
  return response;
}
