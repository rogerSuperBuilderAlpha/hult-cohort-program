import { cookieOptions, sessionCookieName } from "@/lib/auth";
import { LudwittError, askTutor } from "@/lib/ludwitt";
import { getActiveSession } from "@/lib/session";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt || prompt.length > 1200) return Response.json({ error: "Enter a question up to 1,200 characters." }, { status: 400 });

  try {
    const { session, cookieValue } = await getActiveSession(request);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const message = await askTutor(session.accessToken, prompt);
    const text = message.content?.filter((item) => item.type === "text").map((item) => item.text).join("\n") || "No tutor response was returned.";
    const response = Response.json({ text, credits: message["x-ludwitt-credits"] });
    if (cookieValue) response.cookies.set(sessionCookieName, cookieValue, cookieOptions(60 * 60 * 24 * 30));
    return response;
  } catch (error) {
    if (error instanceof LudwittError && error.status === 402) {
      return Response.json({ error: "You’re out of Ludwitt credits for third-party apps.", topUpUrl: "https://pitchrise.ludwitt.com/account/credits" }, { status: 402 });
    }
    const status = error instanceof LudwittError ? error.status : 502;
    return Response.json({ error: "PyByte’s tutor is unavailable right now." }, { status });
  }
}
