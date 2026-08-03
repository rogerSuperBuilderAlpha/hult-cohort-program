import { NextResponse } from "next/server";
import {
  MAX_COMPANY_LEN,
  MAX_EMAIL_LEN,
  MAX_MESSAGE_LEN,
  MAX_NAME_LEN,
  MAX_STUDENT_HANDLES,
  clampText,
} from "@/lib/form-limits";
import { getPerson, isIntroEligible } from "@/lib/people";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import {
  PARTNER_INTEREST_OPTIONS,
  type PartnerInterest,
} from "@/lib/types";

type Body = {
  partnerName?: string;
  company?: string;
  email?: string;
  interest?: string;
  studentHandles?: string[];
  message?: string;
};

const VALID_INTERESTS = new Set(
  PARTNER_INTEREST_OPTIONS.map((option) => option.value)
);

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "request-intro"), 8, 60_000);
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

  const partnerName = clampText(body.partnerName?.trim() ?? "", MAX_NAME_LEN);
  const company = clampText(body.company?.trim() ?? "", MAX_COMPANY_LEN);
  const email = clampText(body.email?.trim() ?? "", MAX_EMAIL_LEN);
  const interest = (body.interest?.trim() ?? "") as PartnerInterest;
  const message = clampText(body.message?.trim() ?? "", MAX_MESSAGE_LEN);
  const studentHandles = Array.isArray(body.studentHandles)
    ? body.studentHandles
        .map((h) => String(h).trim())
        .filter(Boolean)
        .slice(0, MAX_STUDENT_HANDLES)
    : [];

  if (!partnerName || !company || !email || !message) {
    return NextResponse.json(
      { error: "Name, company, email, and message are required." },
      { status: 400 }
    );
  }
  if (!VALID_INTERESTS.has(interest)) {
    return NextResponse.json(
      { error: "Select a type of interest." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }
  if (studentHandles.length === 0) {
    return NextResponse.json(
      { error: "Select at least one developer." },
      { status: 400 }
    );
  }
  for (const handle of studentHandles) {
    const person = getPerson(handle);
    if (!person || !isIntroEligible(person)) {
      return NextResponse.json(
        {
          error: `Developer not available for intro (must be a real public profile): ${handle}`,
        },
        { status: 400 }
      );
    }
  }

  const interestMeta = PARTNER_INTEREST_OPTIONS.find(
    (option) => option.value === interest
  );

  const placement = process.env.PLACEMENT_LEAD_EMAIL || "(unset — demo log only)";
  const payload = {
    type: "request-intro",
    to: placement,
    partnerName,
    company,
    email,
    interest,
    interestLabel: interestMeta
      ? `${interestMeta.label} (${interestMeta.description})`
      : interest,
    studentHandles,
    message,
    receivedAt: new Date().toISOString(),
  };

  console.info("[lighthouse:request-intro]", JSON.stringify(payload));

  return NextResponse.json({ ok: true });
}
