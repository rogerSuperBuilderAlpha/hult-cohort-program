"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  listActiveProfiles,
  startConversation,
} from "@/app/(app)/messages/actions";

type ProfileOption = {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
};

export function StartDmButton() {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    void listActiveProfiles()
      .then((rows) => setProfiles(rows as ProfileOption[]))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load people"))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        p.display_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q),
    );
  }, [profiles, query]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 9) return prev;
      return [...prev, id];
    });
  }

  return (
    <>
      <button
        type="button"
        data-testid="start-dm-open"
        onClick={() => setOpen(true)}
        className="rounded px-2 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
        title="Start a DM"
      >
        +
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-dark)]/40 p-4">
          <div
            data-testid="start-dm-modal"
            className="w-full max-w-md rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-lg"
          >
            <h2 className="text-lg font-semibold text-[var(--color-dark)]">New message</h2>
            <p className="mt-1 text-sm text-[var(--color-secondary)]">
              Pick 1 person for a DM, or up to 9 for a group. Optional custom name for groups.
            </p>

            <label className="mt-4 block text-sm font-medium text-[var(--color-dark)]">
              Search people
              <input
                data-testid="start-dm-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name or email"
                className="mt-1 w-full rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] px-3 py-2 text-sm"
              />
            </label>

            <div
              data-testid="start-dm-people"
              className="mt-3 max-h-48 space-y-1 overflow-y-auto rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--color-secondary)_18%,transparent)] p-2"
            >
              {loading ? (
                <p className="px-2 py-3 text-sm text-[var(--color-secondary)]">Loading…</p>
              ) : filtered.length === 0 ? (
                <p className="px-2 py-3 text-sm text-[var(--color-secondary)]">No people found</p>
              ) : (
                filtered.map((p) => {
                  const checked = selected.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-[var(--color-bg)]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(p.id)}
                        data-testid={`start-dm-person-${p.email}`}
                      />
                      <span className="font-medium text-[var(--color-dark)]">
                        {p.display_name}
                      </span>
                      <span className="truncate text-xs text-[var(--color-secondary)]">
                        {p.email}
                      </span>
                    </label>
                  );
                })
              )}
            </div>

            {selected.length > 1 ? (
              <label className="mt-3 block text-sm font-medium text-[var(--color-dark)]">
                Group name (optional)
                <input
                  data-testid="start-dm-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Design crit"
                  className="mt-1 w-full rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] px-3 py-2 text-sm"
                />
              </label>
            ) : null}

            <p className="mt-2 text-xs text-[var(--color-secondary)]">
              {selected.length} selected{selected.length >= 9 ? " (max 9)" : ""}
            </p>
            {error ? <p className="mt-2 text-sm text-[var(--color-danger)]">{error}</p> : null}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setSelected([]);
                  setName("");
                  setQuery("");
                  setError(null);
                }}
                className="rounded-[var(--radius-button)] px-3 py-2 text-sm text-[var(--color-secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="start-dm-submit"
                disabled={pending || selected.length === 0}
                className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    try {
                      const { id } = await startConversation({
                        memberIds: selected,
                        name: selected.length > 1 ? name : undefined,
                      });
                      setOpen(false);
                      window.location.href = `/messages/${id}`;
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Could not start DM");
                    }
                  });
                }}
              >
                Start
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
