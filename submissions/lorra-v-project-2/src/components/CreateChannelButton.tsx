"use client";

import { useState, useTransition } from "react";
import { createChannel } from "@/app/(app)/channels/actions";

export function CreateChannelButton({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"public" | "private">(isAdmin ? "public" : "private");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        data-testid="create-channel-open"
        onClick={() => setOpen(true)}
        className="rounded px-2 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
        title="Create channel"
      >
        +
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-dark)]/40 p-4">
          <div
            data-testid="create-channel-modal"
            className="w-full max-w-md rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-lg"
          >
            <h2 className="text-lg font-semibold text-[var(--color-dark)]">Create channel</h2>
            <p className="mt-1 text-sm text-[var(--color-secondary)]">
              Public channels are admin-only to create. Members can create private channels.
            </p>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                startTransition(async () => {
                  try {
                    const channel = await createChannel({ name, description, type });
                    setOpen(false);
                    window.location.href = `/channels/${channel.name}`;
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Create failed");
                  }
                });
              }}
            >
              <label className="block text-sm font-medium text-[var(--color-dark)]">
                Name
                <input
                  data-testid="create-channel-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="design-crit"
                  className="mt-1 w-full rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-[var(--color-dark)]">
                Description
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-[var(--color-dark)]">
                Type
                <select
                  data-testid="create-channel-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as "public" | "private")}
                  className="mt-1 w-full rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] px-3 py-2 text-sm"
                >
                  {isAdmin ? <option value="public">Public</option> : null}
                  <option value="private">Private</option>
                </select>
              </label>
              {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-[var(--radius-button)] px-3 py-2 text-sm text-[var(--color-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="create-channel-submit"
                  disabled={pending}
                  className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
