import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  CreateTicketInput,
  ForthTicket,
  PMAdapter,
  PMEvent,
} from "@/lib/forth/types";

function baseUrl() {
  return (
    process.env.NEXT_PUBLIC_FORTH_BASE_URL?.replace(/\/$/, "") ||
    "https://forth-bice.vercel.app"
  );
}

function apiKey() {
  return process.env.FORTH_API_KEY || "";
}

function webhookSecret() {
  return process.env.FORTH_WEBHOOK_SECRET || "";
}

function mapTicket(raw: Record<string, unknown>): ForthTicket {
  const id = String(raw.id ?? "");
  return {
    id,
    title: String(raw.title ?? "Untitled"),
    status: String(raw.status ?? "open"),
    assigneeEmail: (raw.assignee_email as string | null | undefined) ?? null,
    url: String(raw.url ?? `${baseUrl()}/t/${id}`),
    updatedAt: String(raw.updated_at ?? new Date().toISOString()),
    description: raw.description ? String(raw.description) : undefined,
    sourceUrl: raw.source_url ? String(raw.source_url) : undefined,
  };
}

/**
 * Live Forth HTTP adapter (PRD §7.0 / §7.1).
 * Used when FORTH_USE_FIXTURES is not true and FORTH_API_KEY is set.
 */
export class ForthAdapter implements PMAdapter {
  getTicketUrl(ticketId: string): string {
    return `${baseUrl()}/t/${ticketId}`;
  }

  async createTicket(input: CreateTicketInput): Promise<ForthTicket> {
    const key = apiKey();
    if (!key) throw new Error("FORTH_API_KEY is not configured");

    const res = await fetch(`${baseUrl()}/api/integrations/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        assignee_email: input.assigneeEmail || undefined,
        source_url: input.sourceUrl,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Forth createTicket failed (${res.status}): ${text}`);
    }

    const json = (await res.json()) as Record<string, unknown>;
    return mapTicket(json);
  }

  async getTicket(ticketId: string): Promise<ForthTicket | null> {
    const key = apiKey();
    if (!key) throw new Error("FORTH_API_KEY is not configured");

    const res = await fetch(
      `${baseUrl()}/api/integrations/tickets/${encodeURIComponent(ticketId)}`,
      {
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
      },
    );

    if (res.status === 404) return null;
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Forth getTicket failed (${res.status}): ${text}`);
    }

    const json = (await res.json()) as Record<string, unknown>;
    return mapTicket(json);
  }

  verifyWebhook(headers: Headers, rawBody: string): boolean {
    const secret = webhookSecret();
    if (!secret) return false;

    const signature =
      headers.get("x-forth-signature") ||
      headers.get("X-Forth-Signature") ||
      "";
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    const provided = signature.replace(/^sha256=/, "").trim();
    if (!provided || provided.length !== expected.length) return false;

    try {
      return timingSafeEqual(
        Buffer.from(provided, "utf8"),
        Buffer.from(expected, "utf8"),
      );
    } catch {
      return false;
    }
  }

  parseWebhookEvent(body: unknown): PMEvent {
    if (!body || typeof body !== "object") {
      throw new Error("Invalid webhook body");
    }
    const obj = body as Record<string, unknown>;
    const event = String(obj.event ?? "");
    const ticketRaw = obj.ticket;
    if (!ticketRaw || typeof ticketRaw !== "object") {
      throw new Error("Webhook missing ticket");
    }
    const ticket = mapTicket(ticketRaw as Record<string, unknown>);
    if (
      event !== "ticket.created" &&
      event !== "ticket.assigned" &&
      event !== "ticket.status_changed"
    ) {
      throw new Error(`Unsupported webhook event: ${event}`);
    }
    return {
      type: event,
      ticket,
      previousStatus:
        (obj.previous_status as string | null | undefined) ?? null,
    };
  }
}
