import { NextResponse } from "next/server";
import { getPMAdapter, useForthFixtures } from "@/lib/forth";
import { applyForthEvent } from "@/lib/forth/sync";

export const runtime = "nodejs";

/**
 * Forth → Conexus webhook (PRD §7.0 item 5 / §7.3).
 * Header: X-Forth-Signature: sha256=<hmac hex of raw body>
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const adapter = getPMAdapter();

  if (!adapter.verifyWebhook(request.headers, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const event = adapter.parseWebhookEvent(body);
    const result = await applyForthEvent(event);
    return NextResponse.json({
      ok: true,
      fixtures: useForthFixtures(),
      event: event.type,
      ticketId: event.ticket.id,
      ...result,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Webhook failed" },
      { status: 400 },
    );
  }
}
