export const TICKET_MARKER_RE = /<!--conexusticket:([0-9a-f-]{36})-->/i;

export function extractTicketLinkId(body: string): string | null {
  const m = body.match(TICKET_MARKER_RE);
  return m?.[1] ?? null;
}

export function ticketCardBody(linkId: string, title: string, url: string): string {
  return `<!--conexusticket:${linkId}-->\n**Forth ticket:** [${title}](${url})`;
}

export function forthTicketIdFromUrl(text: string): string[] {
  const base =
    process.env.NEXT_PUBLIC_FORTH_BASE_URL?.replace(/\/$/, "") ||
    "https://forth-bice.vercel.app";
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escaped}/t/([A-Za-z0-9_-]+)`, "gi");
  const ids = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    ids.add(match[1]);
  }
  return Array.from(ids);
}
