/** Forth / PM types — PRD §7.1 */

export type ForthTicket = {
  id: string;
  title: string;
  status: string;
  assigneeEmail: string | null;
  url: string;
  updatedAt: string;
  description?: string;
  sourceUrl?: string;
};

export type CreateTicketInput = {
  title: string;
  description: string;
  assigneeEmail?: string | null;
  sourceUrl: string;
};

export type PMEventType =
  | "ticket.created"
  | "ticket.assigned"
  | "ticket.status_changed";

export type PMEvent = {
  type: PMEventType;
  ticket: ForthTicket;
  previousStatus?: string | null;
};

export interface PMAdapter {
  createTicket(input: CreateTicketInput): Promise<ForthTicket>;
  getTicket(ticketId: string): Promise<ForthTicket | null>;
  getTicketUrl(ticketId: string): string;
  verifyWebhook(headers: Headers, rawBody: string): boolean;
  parseWebhookEvent(body: unknown): PMEvent;
}
