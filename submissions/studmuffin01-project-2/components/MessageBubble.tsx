"use client";

import type { Message, MessageFlag } from "@/lib/types";
import { MessageAttachments } from "@/components/MessageAttachments";
import {
  MessageFlagChips,
  MessageFlagControls,
} from "@/components/MessageFlagControls";
import { hasFlag } from "@/lib/messageFlags";
import { safeExternalHref } from "@/lib/urls";

type Props = {
  message: Message;
  authorName: string;
  authorInitials: string;
  timeLabel: string;
  onOpenThread?: () => void;
  onToggleFlag: (flag: MessageFlag) => void;
  compact?: boolean;
};

export function MessageBubble({
  message,
  authorName,
  authorInitials,
  timeLabel,
  onOpenThread,
  onToggleFlag,
  compact = false,
}: Props) {
  const archived = hasFlag(message.flags, "archived");
  const unread = hasFlag(message.flags, "unread");
  const weight = unread ? "font-bold" : "font-normal";
  const ticketHref = safeExternalHref(message.taskLink?.url);

  return (
    <article
      className={`group relative flex gap-2 ${compact ? "" : "animate-fade"} ${
        archived ? "opacity-60" : ""
      }`}
    >
      <div className="flex shrink-0 flex-col items-center pt-1">
        <MessageFlagControls
          flags={message.flags}
          onToggleFlag={onToggleFlag}
          compact={compact}
        />
      </div>

      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-[var(--bg-deep)] font-bold text-[var(--accent-strong)] ${
          compact ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-xs"
        }`}
      >
        {authorInitials}
      </div>

      <div className={`min-w-0 flex-1 ${weight}`}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className={`text-sm text-[var(--ink)] ${weight}`}>
            {authorName}
          </span>
          <time
            className={`text-[11px] text-[var(--ink-faint)] ${
              unread ? "font-bold" : "font-normal"
            }`}
            dateTime={message.createdAt}
          >
            {timeLabel}
          </time>
        </div>
        {message.body ? (
          <p
            className={`mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)] ${weight}`}
          >
            {message.body}
          </p>
        ) : null}

        {!!message.attachments?.length && (
          <MessageAttachments
            attachments={message.attachments}
            compact={compact}
          />
        )}

        {message.taskLink && ticketHref && (
          <a
            href={ticketHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex max-w-full flex-col border border-[var(--line)] bg-[var(--warm-soft)] px-3 py-2 text-left shadow-[var(--shadow-sm)] transition hover:translate-x-px hover:translate-y-px"
          >
            <span className="forth-label text-[var(--warm)]">Forth ticket</span>
            <span className="truncate text-sm font-semibold text-[var(--ink)]">
              {message.taskLink.taskLabel}
            </span>
            <span className="truncate text-xs text-[var(--ink-muted)]">
              {message.taskLink.initiativeTitle}
            </span>
          </a>
        )}

        {message.taskLink && !ticketHref && (
          <div className="mt-2 inline-flex max-w-full flex-col border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-left">
            <span className="forth-label text-[var(--ink-faint)]">
              Ticket link unavailable
            </span>
            <span className="truncate text-sm font-semibold text-[var(--ink)]">
              {message.taskLink.taskLabel}
            </span>
          </div>
        )}

        {(!!message.reactions?.length ||
          !!message.flags?.some((f) => f !== "unread")) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {message.reactions?.map((r) => (
              <span
                key={r.emoji}
                className="rounded-full border border-[var(--line)] bg-[var(--surface-elevated)] px-1.5 py-0 text-[10px] font-medium leading-5"
              >
                {r.emoji} {r.count}
              </span>
            ))}
            <MessageFlagChips
              flags={message.flags}
              onToggleFlag={onToggleFlag}
            />
          </div>
        )}

        {!compact && onOpenThread && (
          <button
            type="button"
            onClick={onOpenThread}
            className="mt-2 text-xs font-medium text-[var(--accent)] opacity-80 transition hover:opacity-100"
          >
            {message.replyCount
              ? `${message.replyCount} ${message.replyCount === 1 ? "reply" : "replies"} — open thread`
              : "Reply in thread"}
          </button>
        )}
      </div>
    </article>
  );
}
