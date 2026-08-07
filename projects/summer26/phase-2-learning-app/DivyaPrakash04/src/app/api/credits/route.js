import { cookieOptions, sessionCookieName } from "@/lib/auth";
import { LudwittError, getCreditBalance } from "@/lib/ludwitt";
import { getActiveSession } from "@/lib/session";

export async function GET(request) {
  try {
    const { session, cookieValue } = await getActiveSession(request);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const balance = await getCreditBalance(session.accessToken);
    const response = Response.json(balance);
    if (cookieValue) response.cookies.set(sessionCookieName, cookieValue, cookieOptions(60 * 60 * 24 * 30));
    return response;
  } catch (error) {
    const status = error instanceof LudwittError ? error.status : 502;
    return Response.json({ error: "Unable to load credits" }, { status });
  }
}
