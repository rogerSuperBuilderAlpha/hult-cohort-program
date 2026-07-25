"use client";

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(ms / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function TicketLinkCard({
  link,
}: {
  link: {
    id: string;
    forth_ticket_id: string;
    forth_url: string;
    title_snapshot: string;
    status_snapshot: string;
    assignee_email_snapshot: string | null;
    last_synced_at: string;
  };
}) {
  return (
    <a
      href={link.forth_url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="ticket-link-card"
      data-ticket-id={link.forth_ticket_id}
      className="mt-2 block rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,white)] px-3 py-3 no-underline transition-colors hover:border-[var(--color-primary)]"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-primary)]">
        Forth ticket
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--color-dark)]">
        {link.title_snapshot}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-secondary)]">
        <span
          data-testid="ticket-status"
          className="rounded-full bg-[var(--color-surface)] px-2 py-0.5 font-medium text-[var(--color-dark)]"
        >
          {link.status_snapshot}
        </span>
        {link.assignee_email_snapshot ? (
          <span className="truncate">{link.assignee_email_snapshot}</span>
        ) : (
          <span>Unassigned</span>
        )}
        <span title={new Date(link.last_synced_at).toLocaleString()}>
          updated {relativeTime(link.last_synced_at)}
        </span>
      </div>
    </a>
  );
}
