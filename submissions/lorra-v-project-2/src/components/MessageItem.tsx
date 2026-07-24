"use client";

import { useMemo, useState } from "react";
import { canEditMessage, formatBytes, formatMessageHtml } from "@/lib/format";
import { REACTION_EMOJI, type Message } from "@/lib/types";
import {
  deleteParentMessage,
  editParentMessage,
  toggleParentReaction,
  type MessageParentType,
} from "@/app/(app)/messaging/actions";
import { CreateForthTicketModal } from "@/components/CreateForthTicketModal";
import { TicketLinkCard } from "@/components/TicketLinkCard";

type UserLike = { id: string; role: string };

export function MessageItem({
  message,
  currentUser,
  parentType,
  pathKey,
  onChanged,
  onOpenThread,
  compact = false,
}: {
  message: Message;
  currentUser: UserLike;
  parentType: MessageParentType;
  pathKey: string;
  onChanged: () => void;
  onOpenThread?: () => void;
  compact?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body_richtext);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forthOpen, setForthOpen] = useState(false);

  const author = Array.isArray(message.profiles)
    ? message.profiles[0]
    : message.profiles;
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
      await toggleParentReaction({
        messageId: message.id,
        emoji,
        parentType,
        pathKey,
      });
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
      await editParentMessage({
        messageId: message.id,
        body: draft,
        parentType,
        pathKey,
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
      await deleteParentMessage({
        messageId: message.id,
        parentType,
        pathKey,
      });
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
          ) : message.ticket_link ? (
            <TicketLinkCard link={message.ticket_link} />
          ) : (
            <div
              className="mt-1 text-sm leading-relaxed text-[var(--color-dark)] [&_a]:text-[var(--color-primary)] [&_code]:rounded [&_code]:bg-[var(--color-bg)] [&_code]:px-1"
              dangerouslySetInnerHTML={{
                __html: formatMessageHtml(
                  message.body_richtext.replace(
                    /<!--conexusticket:[0-9a-f-]+-->\s*/gi,
                    "",
                  ),
                ),
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

          {!compact && onOpenThread ? (
            (message.reply_count ?? 0) > 0 ? (
              <button
                type="button"
                data-testid="thread-replies-open"
                onClick={onOpenThread}
                className="mt-2 flex items-center gap-2 text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                <span className="flex -space-x-1.5">
                  {(message.participants ?? []).slice(0, 3).map((p) => (
                    <span
                      key={p.id}
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-surface)] bg-[color-mix(in_srgb,var(--color-primary)_18%,white)] text-[10px] font-semibold text-[var(--color-dark)]"
                    >
                      {p.display_name.charAt(0).toUpperCase()}
                    </span>
                  ))}
                </span>
                <span>
                  {message.reply_count}{" "}
                  {message.reply_count === 1 ? "reply" : "replies"}
                </span>
                {message.last_reply_at ? (
                  <span className="font-normal text-[var(--color-secondary)]">
                    · last{" "}
                    {new Date(message.last_reply_at).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                ) : null}
              </button>
            ) : (
              <button
                type="button"
                data-testid="message-reply-thread"
                onClick={onOpenThread}
                className="mt-2 text-xs font-medium text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:underline"
              >
                Reply in thread
              </button>
            )
          ) : null}

          {!compact && !message.thread_root_id ? (
            <button
              type="button"
              data-testid="message-create-forth"
              onClick={() => setForthOpen(true)}
              className="mt-1 block text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
              Create Forth ticket
            </button>
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
        {!compact && onOpenThread ? (
          <button
            type="button"
            onClick={onOpenThread}
            className="rounded px-1.5 text-xs text-[var(--color-secondary)] hover:bg-[var(--color-bg)]"
          >
            Reply
          </button>
        ) : null}
        {!compact && !message.thread_root_id ? (
          <button
            type="button"
            onClick={() => setForthOpen(true)}
            className="rounded px-1.5 text-xs text-[var(--color-primary)] hover:bg-[var(--color-bg)]"
          >
            Forth
          </button>
        ) : null}
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

      {forthOpen ? (
        <CreateForthTicketModal
          messageId={message.id}
          defaultTitle={message.body_richtext
            .replace(/<!--conexusticket:[0-9a-f-]+-->/gi, "")
            .trim()}
          pathKey={pathKey}
          onClose={() => setForthOpen(false)}
          onCreated={() => {
            onChanged();
            onOpenThread?.();
          }}
        />
      ) : null}
    </article>
  );
}
