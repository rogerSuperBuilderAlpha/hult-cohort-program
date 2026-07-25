import Link from "next/link";
import { getHomeDigest } from "@/app/(app)/home/actions";
import { hrefForEntityRef } from "@/lib/notifications";

export default async function HomePage() {
  let digest = {
    unreadChannels: [] as Awaited<ReturnType<typeof getHomeDigest>>["unreadChannels"],
    recentMentions: [] as Awaited<ReturnType<typeof getHomeDigest>>["recentMentions"],
    myTickets: [] as Awaited<ReturnType<typeof getHomeDigest>>["myTickets"],
  };
  try {
    digest = await getHomeDigest();
  } catch {
    // shell still renders if digest fails
  }

  return (
    <section
      data-testid="home-digest"
      className="mx-auto max-w-3xl space-y-6"
    >
      <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-[0_1px_2px_rgba(22,50,79,0.04)] md:p-8">
        <p className="text-sm font-medium text-[var(--color-primary)]">Home</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-dark)]">
          Activity digest
        </h1>
        <p className="mt-3 max-w-xl text-[var(--color-secondary)] leading-relaxed">
          Unread channels, recent mentions, and your Forth tickets.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Unread channels", value: String(digest.unreadChannels.length) },
            { label: "Mentions", value: String(digest.recentMentions.length) },
            { label: "Forth tickets", value: String(digest.myTickets.length) },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--color-secondary)_18%,transparent)] bg-[var(--color-bg)] px-4 py-3"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-secondary)]">
                {card.label}
              </p>
              <p className="mt-2 text-xl font-semibold text-[var(--color-dark)]">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        data-testid="home-unread-channels"
        className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6"
      >
        <h2 className="text-sm font-semibold text-[var(--color-dark)]">
          Unread channels
        </h2>
        {digest.unreadChannels.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--color-secondary)]">All caught up.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {digest.unreadChannels.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/channels/${c.name}`}
                  className="flex items-center justify-between rounded-[var(--radius-button)] px-2 py-2 text-sm text-[var(--color-dark)] hover:bg-[var(--color-bg)]"
                >
                  <span>#{c.name}</span>
                  <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs font-semibold text-white">
                    {c.unreadCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        data-testid="home-mentions"
        className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6"
      >
        <h2 className="text-sm font-semibold text-[var(--color-dark)]">
          Recent mentions
        </h2>
        {digest.recentMentions.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--color-secondary)]">No recent @mentions.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {digest.recentMentions.map((m) => {
              const href = hrefForEntityRef(m.entity_ref);
              const label = `${m.actor_name || "Someone"} mentioned you`;
              return (
                <li key={m.id}>
                  <Link
                    href={href}
                    className="block rounded-[var(--radius-button)] px-2 py-2 text-sm text-[var(--color-dark)] hover:bg-[var(--color-bg)]"
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div
        data-testid="home-tickets"
        className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[var(--color-dark)]">
            Your Forth tickets
          </h2>
          <Link
            href="/tasks"
            className="text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            View all
          </Link>
        </div>
        {digest.myTickets.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--color-secondary)]">
            No assigned or created TicketLinks yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {digest.myTickets.map((t) => (
              <li key={t.id}>
                <a
                  href={t.forth_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="home-ticket-row"
                  className="flex items-center justify-between gap-2 rounded-[var(--radius-button)] px-2 py-2 text-sm no-underline hover:bg-[var(--color-bg)]"
                >
                  <span className="truncate text-[var(--color-dark)]">
                    {t.title_snapshot}
                  </span>
                  <span className="shrink-0 text-xs text-[var(--color-secondary)]">
                    {t.status_snapshot}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
