import Link from "next/link";
import { listConversations } from "@/app/(app)/messages/actions";
import { StartDmButton } from "@/components/StartDmButton";
import { EmptyState } from "@/components/EmptyState";

export default async function MessagesPage() {
  const conversations = await listConversations();

  return (
    <section
      data-testid="messages-page"
      className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 md:p-8"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-dark)]">Messages</h1>
          <p className="mt-2 text-sm text-[var(--color-secondary)]">
            1:1 and group DMs. Same composer as channels — no pinning.
          </p>
        </div>
        <div className="rounded-[var(--radius-button)] bg-[var(--color-dark)] px-1">
          <StartDmButton />
        </div>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          testId="messages-empty"
          title="No conversations yet"
          description="Start a 1:1 or group DM from the sidebar + button."
        />
      ) : (
        <ul data-testid="messages-list" className="mt-6 divide-y divide-[color-mix(in_srgb,var(--color-secondary)_15%,transparent)]">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/messages/${c.id}`}
                data-testid={`dm-link-${c.id}`}
                className="flex items-center justify-between gap-3 py-3 text-sm hover:text-[var(--color-primary)]"
              >
                <span className="font-medium text-[var(--color-dark)]">{c.title}</span>
                <span className="text-xs text-[var(--color-secondary)]">
                  {c.type === "group_dm" ? "Group" : "DM"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
