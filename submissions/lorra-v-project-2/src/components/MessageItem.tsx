"use client";

import { useMemo, useState } from "react";
import { canEditMessage, formatBytes, formatMessageHtml } from "@/lib/format";
import { REACTION_EMOJI, type Message } from "@/lib/types";
import {
  deleteChannelMessage,
  editChannelMessage,
  toggleReaction,
} from "@/app/(app)/channels/actions";

type UserLike = { id: string; role: string };

export function MessageItem({
  message,
  currentUser,
  channelSlug,
  onChanged,
}: {
  message: Message;
  currentUser: UserLike;
  channelSlug: string;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body_richtext);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const author = message.profiles;
  const isOwn = message.author_id === currentUser.id;
  const isAdmin = currentUser.role === "admin";
  const editable = isOwn && canEditMessage(message.created_at, message.edited_at);

  const reactionGroups = useMemo(() => {
    const map = new Map<string, { count: number; mine: boolean }>();
    for (const r of message.reactions ?? []) {
      const cur = map.get(r.emoji) ?? { count: 0, mine: false };
      cur.count += 1;
      if (r.user_id === currentUser.id) cur.mine = true;
      map.set(r.emoji, cur);
    }
    return [...map.entries()];
  }, [message.reactions, currentUser.id]);

  async function onToggle(emoji: string) {
    setBusy(true);
    setError(null);
    try {
      await toggleReaction({ messageId: message.id, emoji, channelSlug });
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reaction failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveEdit() {
    setBusy(true);
    setError(null);
    try {
      await editChannelMessage({
        messageId: message.id,
        body: draft,
        channelSlug,
      });
      setEditing(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Edit failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this message?")) return;
    setBusy(true);
    setError(null);
    try {
      await deleteChannelMessage({ messageId: message.id, channelSlug });
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article
      data-testid="message-item"
      data-message-id={message.id}
      className="group relative rounded-[var(--radius-card)] px-3 py-2 hover:bg-[var(--color-bg)]"
    >
      <div className="flex gap-3">
        <div
          aria-hidden
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_20%,white)] text-sm font-semibold text-[var(--color-dark)]"
        >
          {(author?.display_name || "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-semibold text-[var(--color-dark)]">
              {author?.display_name || "Unknown"}
            </span>
            <span className="text-xs text-[var(--color-secondary)]">{time}</span>
            {message.edited_at ? (
              <span className="text-xs text-[var(--color-secondary)]">(edited)</span>
            ) : null}
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={onSaveEdit}
                  className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setDraft(message.body_richtext);
                  }}
                  className="rounded-[var(--radius-button)] px-3 py-1.5 text-xs text-[var(--color-secondary)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              className="mt-1 text-sm leading-relaxed text-[var(--color-dark)] [&_a]:text-[var(--color-primary)] [&_code]:rounded [&_code]:bg-[var(--color-bg)] [&_code]:px-1"
              dangerouslySetInnerHTML={{
                __html: formatMessageHtml(message.body_richtext),
              }}
            />
          )}

          {(message.attachments?.length ?? 0) > 0 ? (
            <ul className="mt-2 space-y-1">
              {message.attachments!.map((a) => (
                <li key={a.id}>
                  <a
                    href={a.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_srgb,var(--color-secondary)_18%,transparent)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-dark)]"
                  >
                    <span className="font-medium">{a.file_name}</span>
                    <span className="text-[var(--color-secondary)]">
                      {formatBytes(a.size_bytes)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          {reactionGroups.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {reactionGroups.map(([emoji, meta]) => (
                <button
                  key={emoji}
                  type="button"
                  disabled={busy}
                  onClick={() => onToggle(emoji)}
                  className={[
                    "rounded-full border px-2 py-0.5 text-xs",
                    meta.mine
                      ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_12%,white)]"
                      : "border-[color-mix(in_srgb,var(--color-secondary)_20%,transparent)] bg-[var(--color-surface)]",
                  ].join(" ")}
                >
                  {emoji} {meta.count}
                </button>
              ))}
            </div>
          ) : null}

          {(message.reply_count ?? 0) > 0 ? (
            <p className="mt-2 text-xs font-medium text-[var(--color-primary)]">
              {message.reply_count} {message.reply_count === 1 ? "reply" : "replies"} — threads in
              Step 6
            </p>
          ) : null}

          {error ? <p className="mt-2 text-xs text-[var(--color-danger)]">{error}</p> : null}
        </div>
      </div>

      <div className="absolute right-2 top-2 hidden gap-1 rounded-[var(--radius-button)] border border-[color-mix(in_srgb,var(--color-secondary)_18%,transparent)] bg-[var(--color-surface)] p-1 shadow-sm group-hover:flex">
        {REACTION_EMOJI.map((emoji) => (
          <button
            key={emoji}
            type="button"
            title={`React ${emoji}`}
            disabled={busy}
            onClick={() => onToggle(emoji)}
            className="rounded px-1 text-sm hover:bg-[var(--color-bg)]"
          >
            {emoji}
          </button>
        ))}
        {editable ? (
          <button
            type="button"
            data-testid="message-edit"
            onClick={() => setEditing(true)}
            className="rounded px-1.5 text-xs text-[var(--color-secondary)] hover:bg-[var(--color-bg)]"
          >
            Edit
          </button>
        ) : null}
        {isOwn || isAdmin ? (
          <button
            type="button"
            data-testid="message-delete"
            onClick={onDelete}
            className="rounded px-1.5 text-xs text-[var(--color-danger)] hover:bg-[var(--color-bg)]"
          >
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}
