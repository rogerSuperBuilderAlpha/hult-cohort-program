/** Deep links into Forth (Project 1 PM platform). */
export const FORTH_BASE_URL =
  process.env.NEXT_PUBLIC_FORTH_URL?.trim() || "https://forth-bice.vercel.app";

export function forthHomeUrl(): string {
  return FORTH_BASE_URL;
}

export function forthTicketsUrl(): string {
  return `${FORTH_BASE_URL}/tickets`;
}

export function forthTicketUrl(
  campaignSlug: string,
  ticketHint?: string
): string {
  const base = `${FORTH_BASE_URL}/tickets?campaign=${encodeURIComponent(campaignSlug)}`;
  if (!ticketHint) return base;
  return `${base}&ticket=${encodeURIComponent(ticketHint)}`;
}

function slugifyCampaign(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "campaign";
}

/** True when the user started a /ticket or /task command but omitted `Campaign | Label`. */
export function isIncompleteTicketSlash(input: string): boolean {
  const trimmed = input.trim();
  if (!/^\/(?:task|ticket)\b/i.test(trimmed)) return false;
  return parseTaskSlashCommand(trimmed) === null;
}

export function parseTaskSlashCommand(input: string): {
  rest: string;
  taskLink?: {
    initiativeTitle: string;
    taskLabel: string;
    url: string;
  };
} | null {
  // /task Campaign Name | Ticket label  (also accepts /ticket)
  const match = input.match(/^\/(?:task|ticket)\s+(.+?)\s*\|\s*(.+)$/i);
  if (!match) return null;
  const initiativeTitle = match[1].trim();
  const taskLabel = match[2].trim();
  if (!initiativeTitle || !taskLabel) return null;
  const slug = slugifyCampaign(initiativeTitle);
  return {
    rest: `Linked ticket: ${taskLabel}`,
    taskLink: {
      initiativeTitle,
      taskLabel,
      url: forthTicketUrl(slug, taskLabel),
    },
  };
}
