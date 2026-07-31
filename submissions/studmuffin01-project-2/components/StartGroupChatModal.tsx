"use client";

import { useMemo, useState } from "react";
import type { Member, WorkspaceState } from "@/lib/types";

type Props = {
  state: WorkspaceState;
  onClose: () => void;
  onCreate: (name: string, memberIds: string[]) => void;
};

export function StartGroupChatModal({ state, onClose, onCreate }: Props) {
  const candidates = useMemo(
    () => state.members.filter((m) => m.id !== state.currentUserId),
    [state.members, state.currentUserId]
  );
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(member: Member) {
    setSelected((prev) =>
      prev.includes(member.id)
        ? prev.filter((id) => id !== member.id)
        : [...prev, member.id]
    );
  }

  const canCreate = name.trim().length > 0 && selected.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--ink)]/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-labelledby="start-group-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow)]"
      >
        <h2
          id="start-group-title"
          className="font-[family-name:var(--font-source-serif)] text-lg font-semibold text-[var(--ink)]"
        >
          Start group chat
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Name the group and choose who to include. You can add or remove
          members later.
        </p>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
          Group name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Project 2 builders"
            className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            autoFocus
          />
        </label>

        <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
          Select members
        </p>
        <ul className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-[var(--line)] p-2">
          {candidates.map((member) => {
            const checked = selected.includes(member.id);
            return (
              <li key={member.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-[var(--bg)]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(member)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-deep)] text-[10px] font-bold text-[var(--accent-strong)]">
                    {member.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[var(--ink)]">
                      {member.name}
                    </span>
                    <span className="text-xs text-[var(--ink-faint)]">
                      @{member.handle}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink-muted)] hover:bg-[var(--bg)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canCreate}
            onClick={() => onCreate(name, selected)}
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create group
          </button>
        </div>
      </div>
    </div>
  );
}
