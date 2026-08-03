import { NextResponse } from "next/server";
import { z } from "zod";
import { addIntro, notifyPlacementLead } from "@/lib/store";

const schema = z.object({
  partnerName: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(200),
  studentHandles: z.array(z.string().trim().min(1)).min(1).max(12),
  message: z.string().trim().min(10).max(4000),
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
      { error: "Check name, company, email, students, and message." },
      { status: 400 },
    );
  }

  const row = addIntro(parsed.data);
  await notifyPlacementLead(
    `[Trailmark] Intro request from ${row.company}`,
    [
      `Partner: ${row.partnerName}`,
      `Company: ${row.company}`,
      `Email: ${row.email}`,
      `Students: ${row.studentHandles.join(", ")}`,
      "",
      row.message,
      "",
      `id=${row.id}`,
      `at=${row.createdAt}`,
    ].join("\n"),
  );

  return NextResponse.json({ ok: true, id: row.id });
}
