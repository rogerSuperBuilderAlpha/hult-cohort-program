import { NextResponse } from "next/server";
import {
  MAX_COMPANY_LEN,
  MAX_EMAIL_LEN,
  MAX_NAME_LEN,
  clampText,
} from "@/lib/form-limits";
import { clientKey, rateLimit } from "@/lib/rate-limit";

type Body = {
  name?: string;
  email?: string;
  company?: string;
  attending?: string;
};

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "rsvp"), 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = clampText(body.name?.trim() ?? "", MAX_NAME_LEN);
  const email = clampText(body.email?.trim() ?? "", MAX_EMAIL_LEN);
  const company = clampText(body.company?.trim() ?? "", MAX_COMPANY_LEN);
  const attending = body.attending === "maybe" ? "maybe" : "yes";

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const placement = process.env.PLACEMENT_LEAD_EMAIL || "(unset — demo log only)";
  const payload = {
    type: "showcase-rsvp",
    to: placement,
    name,
    email,
    company: company || null,
    attending,
    receivedAt: new Date().toISOString(),
  };

  console.info("[lighthouse:rsvp]", JSON.stringify(payload));

  return NextResponse.json({ ok: true });
}
