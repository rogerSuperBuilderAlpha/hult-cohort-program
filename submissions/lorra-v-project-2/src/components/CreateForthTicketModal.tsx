"use client";

import { useEffect, useState, useTransition } from "react";
import {
  createTicketFromMessage,
  listAssigneeOptions,
} from "@/app/(app)/forth/actions";
import { useToast } from "@/components/ToastProvider";

export function CreateForthTicketModal({
  messageId,
  defaultTitle,
  pathKey,
  onClose,
  onCreated,
}: {
  messageId: string;
  defaultTitle: string;
  pathKey: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState(defaultTitle.slice(0, 120));
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [people, setPeople] = useState<
    { id: string; display_name: string; email: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { pushToast } = useToast();

  useEffect(() => {
    void listAssigneeOptions()
      .then(setPeople)
      .catch(() => undefined);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-dark)]/40 p-4">
      <div
        data-testid="create-forth-modal"
        className="w-full max-w-md rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-[var(--color-dark)]">
          Create Forth ticket
        </h2>
        <p className="mt-1 text-sm text-[var(--color-secondary)]">
          Posts a TicketLink card as a thread reply and deep-links to Forth.
        </p>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            startTransition(async () => {
              try {
                await createTicketFromMessage({
                  messageId,
                  title,
                  assigneeEmail: assigneeEmail || null,
                  pathKey,
                });
                pushToast("Forth ticket created", "success");
                onCreated();
                onClose();
              } catch (err) {
                const msg = err instanceof Error ? err.message : "Create failed";
                setError(msg);
                pushToast(msg, "error");
              }
            });
          }}
        >
          <label className="block text-sm font-medium text-[var(--color-dark)]">
            Title
            <input
              data-testid="forth-ticket-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-[var(--color-dark)]">
            Assignee (optional)
            <select
              data-testid="forth-ticket-assignee"
              value={assigneeEmail}
              onChange={(e) => setAssigneeEmail(e.target.value)}
              className="mt-1 w-full rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] px-3 py-2 text-sm"
            >
              <option value="">Unassigned</option>
              {people.map((p) => (
                <option key={p.id} value={p.email}>
                  {p.display_name} ({p.email})
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <p className="text-sm text-[var(--color-danger)]" data-testid="forth-ticket-error">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--radius-button)] px-3 py-2 text-sm text-[var(--color-secondary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="forth-ticket-submit"
              disabled={pending}
              className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Create ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
