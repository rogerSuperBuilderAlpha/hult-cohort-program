import { NextResponse } from "next/server";
import { z } from "zod";
import { addRsvp, notifyPlacementLead } from "@/lib/store";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(200),
  attendance: z.enum(["in-person", "virtual"]),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check name, company, email, and attendance." },
      { status: 400 },
    );
  }

  const row = addRsvp(parsed.data);
  await notifyPlacementLead(
    `[Trailmark] Showcase RSVP — ${row.company}`,
    [
      `Name: ${row.name}`,
      `Company: ${row.company}`,
      `Email: ${row.email}`,
      `Attendance: ${row.attendance}`,
      `id=${row.id}`,
      `at=${row.createdAt}`,
    ].join("\n"),
  );

  return NextResponse.json({ ok: true, id: row.id });
}
