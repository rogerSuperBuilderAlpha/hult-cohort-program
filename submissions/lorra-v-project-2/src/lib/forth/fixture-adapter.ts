import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
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

function webhookSecret() {
  return process.env.FORTH_WEBHOOK_SECRET || "conexus-forth-fixture-secret";
}

/** Process-local fixture store (demo / local until §7.0 live). */
const store = new Map<string, ForthTicket>();

function seedDefaults() {
  if (store.size > 0) return;
  const samples: ForthTicket[] = [
    {
      id: "fix-demo-1",
      title: "Welcome cohort kickoff checklist",
      status: "open",
      assigneeEmail: "asha@conexus.local",
      url: `${baseUrl()}/t/fix-demo-1`,
      updatedAt: new Date().toISOString(),
      description: "Fixture ticket for local Conexus demos",
    },
    {
      id: "fix-demo-2",
      title: "Ship Phase 1 Project 2",
      status: "in_progress",
      assigneeEmail: "admin@conexus.local",
      url: `${baseUrl()}/t/fix-demo-2`,
      updatedAt: new Date().toISOString(),
    },
  ];
  for (const t of samples) store.set(t.id, t);
}

/**
 * Fixture-backed adapter so Step 8–9 never block on Forth HTTP (PRD tip).
 * Also serves as LinkOnly-capable deep links via getTicketUrl.
 */
export class FixtureAdapter implements PMAdapter {
  constructor() {
    seedDefaults();
  }

  getTicketUrl(ticketId: string): string {
    return `${baseUrl()}/t/${ticketId}`;
  }

  async createTicket(input: CreateTicketInput): Promise<ForthTicket> {
    seedDefaults();
    const id = `fix-${randomUUID().slice(0, 8)}`;
    const ticket: ForthTicket = {
      id,
      title: input.title.trim() || "Untitled",
      status: "open",
      assigneeEmail: input.assigneeEmail?.trim() || null,
      url: this.getTicketUrl(id),
      updatedAt: new Date().toISOString(),
      description: input.description,
      sourceUrl: input.sourceUrl,
    };
    store.set(id, ticket);
    return ticket;
  }

  async getTicket(ticketId: string): Promise<ForthTicket | null> {
    seedDefaults();
    return store.get(ticketId) ?? null;
  }

  /** Test helper: mutate a fixture ticket (simulates Forth updates). */
  upsertFixture(ticket: ForthTicket) {
    seedDefaults();
    store.set(ticket.id, { ...ticket, updatedAt: new Date().toISOString() });
  }

  verifyWebhook(headers: Headers, rawBody: string): boolean {
    const secret = webhookSecret();
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
    const ticketRaw = obj.ticket as Record<string, unknown> | undefined;
    if (!ticketRaw) throw new Error("Webhook missing ticket");

    const id = String(ticketRaw.id ?? "");
    const ticket: ForthTicket = {
      id,
      title: String(ticketRaw.title ?? "Untitled"),
      status: String(ticketRaw.status ?? "open"),
      assigneeEmail:
        (ticketRaw.assignee_email as string | null | undefined) ?? null,
      url: String(ticketRaw.url ?? this.getTicketUrl(id)),
      updatedAt: String(ticketRaw.updated_at ?? new Date().toISOString()),
    };

    if (
      event !== "ticket.created" &&
      event !== "ticket.assigned" &&
      event !== "ticket.status_changed"
    ) {
      throw new Error(`Unsupported webhook event: ${event}`);
    }

    // Keep fixture store in sync when webhook fires in fixture mode
    store.set(id, ticket);

    return {
      type: event,
      ticket,
      previousStatus:
        (obj.previous_status as string | null | undefined) ?? null,
    };
  }
}

export function getFixtureStoreSize() {
  seedDefaults();
  return store.size;
}
