"use client";

import { useMemo, useState } from "react";
import type {
  Attachment,
  Channel,
  Message,
  MessageFlag,
  WorkspaceState,
} from "@/lib/types";
import { isGroupCreator, memberById } from "@/lib/workspace";
import { formatTime } from "@/lib/format";
import { hasFlag } from "@/lib/messageFlags";
import { MessageBubble } from "@/components/MessageBubble";
import { MessageComposer } from "@/components/MessageComposer";

type MessageViewFilter =
  | "active"
  | "all"
  | "action"
  | "urgent"
  | "important"
  | "unread"
  | "archived";

type Props = {
  channel: Channel;
  messages: Message[];
  state: WorkspaceState;
  draft: string;
  attachments: Attachment[];
  currentUserName: string;
  onDraftChange: (value: string) => void;
  onAttachmentsChange: (attachments: Attachment[]) => void;
  onSend: () => void;
  onOpenThread: (id: string) => void;
  onOpenMobileNav: () => void;
  onManageGroup?: () => void;
  onToggleFlag: (messageId: string, flag: MessageFlag) => void;
  onOpenAi?: () => void;
  aiOpen?: boolean;
};

function channelTitle(channel: Channel) {
  if (channel.kind === "channel") return `#${channel.name}`;
  return channel.name;
}

const FILTERS: { id: MessageViewFilter; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "action", label: "Action" },
  { id: "urgent", label: "Urgent" },
  { id: "important", label: "Important" },
  { id: "unread", label: "Unread" },
  { id: "archived", label: "Archived" },
  { id: "all", label: "All" },
];

function matchesFilter(message: Message, filter: MessageViewFilter): boolean {
  switch (filter) {
    case "active":
      return !hasFlag(message.flags, "archived");
    case "all":
      return true;
    case "archived":
      return hasFlag(message.flags, "archived");
    case "action":
    case "urgent":
    case "important":
    case "unread":
      return hasFlag(message.flags, filter);
    default:
      return true;
  }
}

export function MessagePane({
  channel,
  messages,
  state,
  draft,
  attachments,
  currentUserName,
  onDraftChange,
  onAttachmentsChange,
  onSend,
  onOpenThread,
  onOpenMobileNav,
  onManageGroup,
  onToggleFlag,
  onOpenAi,
  aiOpen = false,
}: Props) {
  const [filter, setFilter] = useState<MessageViewFilter>("active");
  const title = channelTitle(channel);
  const canManage =
    channel.kind === "group" &&
    isGroupCreator(channel, state.currentUserId) &&
    onManageGroup;

  const visible = useMemo(
    () => messages.filter((m) => matchesFilter(m, filter)),
    [messages, filter]
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="border-b-[1.5px] border-[var(--line)] bg-[var(--surface)] px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenMobileNav}
                className="forth-btn border-[var(--line)] bg-[var(--surface-elevated)] px-2 py-1 text-[var(--ink)] lg:hidden"
              >
                Menu
              </button>
              <h1 className="truncate font-[family-name:var(--font-source-serif)] text-xl font-semibold sm:text-2xl">
                {title}
              </h1>
            </div>
            {channel.description && (
              <p className="mt-0.5 truncate font-[family-name:var(--font-ibm-plex-mono)] text-[11px] text-[var(--ink-faint)] sm:text-xs">
                {channel.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {canManage && (
              <button
                type="button"
                onClick={onManageGroup}
                className="forth-btn bg-[var(--surface-elevated)] px-3 py-1.5 text-[var(--ink)]"
              >
                Manage members
              </button>
            )}
            {onOpenAi && !aiOpen && (
              <button
                type="button"
                onClick={onOpenAi}
                className="forth-btn bg-[var(--accent)] px-3 py-1.5 text-[var(--sidebar-text)]"
              >
                Fireside AI
              </button>
            )}
            <p className="hidden font-[family-name:var(--font-ibm-plex-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--warm)] lg:block">
              {currentUserName}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`border px-2.5 py-1 font-[family-name:var(--font-ibm-plex-mono)] text-[10px] font-semibold uppercase tracking-[0.08em] ${
                filter === f.id
                  ? "border-[var(--line)] bg-[var(--accent)] text-[var(--sidebar-text)] shadow-[var(--shadow-sm)]"
                  : "border-[var(--line)] bg-[var(--bg)] text-[var(--ink-muted)] hover:bg-[var(--olive-soft)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto bg-[var(--bg)]/40 px-4 py-5 sm:px-5">
        {visible.length === 0 ? (
          <p className="border border-dashed border-[var(--line)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--ink-muted)]">
            {filter === "active"
              ? "No active messages here yet. Share a note or file — flag items so Fireside AI can track them."
              : `No messages match “${filter}” in this chat.`}
          </p>
        ) : (
          visible.map((message) => {
            const author = memberById(state, message.authorId);
            return (
              <MessageBubble
                key={message.id}
                message={message}
                authorName={author?.name ?? "Unknown"}
                authorInitials={author?.initials ?? "?"}
                timeLabel={formatTime(message.createdAt)}
                onOpenThread={() => onOpenThread(message.id)}
                onToggleFlag={(flag) => onToggleFlag(message.id, flag)}
              />
            );
          })
        )}
      </div>

      <div className="border-t-[1.5px] border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
        <MessageComposer
          composerId="fireside-composer"
          draft={draft}
          attachments={attachments}
          placeholder={`Message ${title}…  attach files or /ticket Campaign | Ticket label`}
          submitLabel="Send"
          onDraftChange={onDraftChange}
          onAttachmentsChange={onAttachmentsChange}
          onSend={onSend}
        />
      </div>
    </div>
  );
}
