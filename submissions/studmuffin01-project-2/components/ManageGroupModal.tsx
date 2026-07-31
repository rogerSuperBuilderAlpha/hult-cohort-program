"use client";

import { useEffect, useMemo, useState } from "react";
import type { Channel, WorkspaceState } from "@/lib/types";
import { memberById } from "@/lib/workspace";

type Props = {
  state: WorkspaceState;
  channel: Channel;
  onClose: () => void;
  onRename: (name: string) => void;
  onAddMembers: (memberIds: string[]) => void;
  onRemoveMember: (memberId: string) => void;
};

export function ManageGroupModal({
  state,
  channel,
  onClose,
  onRename,
  onAddMembers,
  onRemoveMember,
}: Props) {
  const [nameDraft, setNameDraft] = useState(channel.name);
  const [toAdd, setToAdd] = useState<string[]>([]);

  useEffect(() => {
    setNameDraft(channel.name);
  }, [channel.id, channel.name]);

  const members = useMemo(
    () =>
      (channel.memberIds ?? [])
        .map((id) => memberById(state, id))
        .filter(Boolean),
    [channel.memberIds, state]
  );

  const available = useMemo(
    () =>
      state.members.filter(
        (m) => !(channel.memberIds ?? []).includes(m.id)
      ),
    [state.members, channel.memberIds]
  );

  function toggleAdd(id: string) {
    setToAdd((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

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
        aria-labelledby="manage-group-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl border border-[var(--line)] bg-[var(--surface-elevated)] shadow-[var(--shadow)]"
      >
        <div className="border-b border-[var(--line)] px-5 py-4">
          <h2
            id="manage-group-title"
            className="font-[family-name:var(--font-source-serif)] text-lg font-semibold text-[var(--ink)]"
          >
            Manage group
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            As the creator, you can rename the group and add or remove members.
          </p>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
            Group name
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              />
              <button
                type="button"
                disabled={!nameDraft.trim() || nameDraft.trim() === channel.name}
                onClick={() => onRename(nameDraft)}
                className="shrink-0 rounded-full bg-[var(--ink)] px-3 py-2 text-sm font-semibold text-[var(--surface)] disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </label>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
              Members ({members.length})
            </p>
            <ul className="space-y-1 rounded-xl border border-[var(--line)] p-2">
              {members.map((member) => {
                if (!member) return null;
                const isCreator = member.id === channel.createdById;
                return (
                  <li
                    key={member.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-2"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-deep)] text-[10px] font-bold text-[var(--accent-strong)]">
                      {member.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[var(--ink)]">
                        {member.name}
                        {isCreator ? " (creator)" : ""}
                        {member.id === state.currentUserId ? " · you" : ""}
                      </span>
                      <span className="text-xs text-[var(--ink-faint)]">
                        @{member.handle}
                      </span>
                    </span>
                    {!isCreator && (
                      <button
                        type="button"
                        onClick={() => onRemoveMember(member.id)}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                      >
                        Remove
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
              Add members
            </p>
            {available.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--line)] px-3 py-4 text-center text-sm text-[var(--ink-muted)]">
                Everyone on the team is already in this group.
              </p>
            ) : (
              <>
                <ul className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-[var(--line)] p-2">
                  {available.map((member) => (
                    <li key={member.id}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--bg)]">
                        <input
                          type="checkbox"
                          checked={toAdd.includes(member.id)}
                          onChange={() => toggleAdd(member.id)}
                          className="h-4 w-4 accent-[var(--accent)]"
                        />
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-deep)] text-[10px] font-bold text-[var(--accent-strong)]">
                          {member.initials}
                        </span>
                        <span className="text-sm font-medium text-[var(--ink)]">
                          {member.name}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={toAdd.length === 0}
                  onClick={() => {
                    onAddMembers(toAdd);
                    setToAdd([]);
                  }}
                  className="mt-2 w-full rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Add selected ({toAdd.length})
                </button>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--line)] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink-muted)] hover:bg-[var(--bg)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
