import { cookieOptions, publicProfile, sessionCookieName } from "@/lib/auth";
import { getActiveSession } from "@/lib/session";

export async function GET(request) {
  const { session, cookieValue } = await getActiveSession(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = Response.json(publicProfile(session));
  if (cookieValue) response.cookies.set(sessionCookieName, cookieValue, cookieOptions(60 * 60 * 24 * 30));
  return response;
}
