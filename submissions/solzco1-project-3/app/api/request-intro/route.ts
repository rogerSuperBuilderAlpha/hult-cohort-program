import { NextResponse } from "next/server";
import { getBuilder } from "@/lib/roster";
import { PLACEMENT_EMAIL } from "@/lib/config";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { PARTNER_INTEREST_OPTIONS } from "@/lib/types";

type Body = {
  partnerName?: string;
  company?: string;
  email?: string;
  interest?: string;
  studentHandles?: string[];
  message?: string;
  inquiryType?: string;
};

const VALID = new Set(PARTNER_INTEREST_OPTIONS.map((o) => o.value));

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const partnerName = (body.partnerName ?? "").trim().slice(0, 120);
  const company = (body.company ?? "").trim().slice(0, 120);
  const email = (body.email ?? "").trim().slice(0, 200);
  const interest = (body.interest ?? "").trim();
  const message = (body.message ?? "").trim().slice(0, 2000);
  const studentHandles = Array.isArray(body.studentHandles)
    ? body.studentHandles.map((h) => String(h).trim()).filter(Boolean).slice(0, 10)
    : [];

  if (!partnerName || !company || !email || !message) {
    return NextResponse.json(
      { error: "Name, company, email, and message are required." },
      { status: 400 }
    );
  }
  if (!VALID.has(interest as typeof PARTNER_INTEREST_OPTIONS[number]["value"])) {
    return NextResponse.json({ error: "Select a valid interest." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }
  if (studentHandles.length === 0) {
    return NextResponse.json(
      { error: "Select at least one builder." },
      { status: 400 }
    );
  }
  for (const handle of studentHandles) {
    const person = getBuilder(handle);
    if (!person || person.privacy !== "public") {
      return NextResponse.json(
        { error: `Builder not available: ${handle}` },
        { status: 400 }
      );
    }
  }

  const payload = {
    partner_name: partnerName,
    company,
    email,
    interest,
    student_handles: studentHandles,
    message,
    inquiry_type: body.inquiryType ?? "intro",
  };

  const supabase = getServiceSupabase();
  if (supabase) {
    const { error } = await supabase.from("partner_inquiries").insert(payload);
    if (error) {
      console.error("[pulse:request-intro] supabase", error.message);
    }
  }

  console.info(
    "[pulse:request-intro]",
    JSON.stringify({ to: PLACEMENT_EMAIL, ...payload, at: new Date().toISOString() })
  );

  return NextResponse.json({ ok: true });
}
