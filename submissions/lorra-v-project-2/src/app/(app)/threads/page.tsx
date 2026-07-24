import Link from "next/link";
import { listSubscribedThreads } from "@/app/(app)/threads/actions";

export default async function ThreadsPage() {
  const threads = await listSubscribedThreads();

  return (
    <section
      data-testid="threads-page"
      className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 md:p-8"
    >
      <h1 className="text-2xl font-semibold text-[var(--color-dark)]">Threads</h1>
      <p className="mt-2 text-sm text-[var(--color-secondary)]">
        Threads you started, replied to, or were mentioned in — sorted by latest activity.
      </p>

      {threads.length === 0 ? (
        <p data-testid="threads-empty" className="mt-8 text-sm text-[var(--color-secondary)]">
          No subscribed threads yet. Open a message and click Reply to start one.
        </p>
      ) : (
        <ul data-testid="threads-list" className="mt-6 divide-y divide-[color-mix(in_srgb,var(--color-secondary)_15%,transparent)]">
          {threads.map((t) => (
            <li key={t.root_id}>
              <Link
                href={t.href}
                data-testid={`thread-link-${t.root_id}`}
                className="flex items-start gap-3 py-4 hover:opacity-90"
              >
                <div className="flex -space-x-1.5 pt-0.5">
                  {t.participants.slice(0, 3).map((p) => (
                    <span
                      key={p.id}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-surface)] bg-[color-mix(in_srgb,var(--color-primary)_18%,white)] text-xs font-semibold text-[var(--color-dark)]"
                    >
                      {p.display_name.charAt(0).toUpperCase()}
                    </span>
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-[var(--color-primary)]">
                      {t.parent_label}
                    </span>
                    {t.unread ? (
                      <span
                        data-testid="thread-unread"
                        className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                      >
                        Unread
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-[var(--color-dark)]">
                    {t.root.body_richtext.slice(0, 120) || "(attachment)"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-secondary)]">
                    {t.reply_count} {t.reply_count === 1 ? "reply" : "replies"} ·{" "}
                    {new Date(t.last_activity_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
