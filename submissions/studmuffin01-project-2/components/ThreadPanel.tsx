"use client";

import type {
  Attachment,
  Message,
  MessageFlag,
  WorkspaceState,
} from "@/lib/types";
import { memberById } from "@/lib/workspace";
import { formatTime } from "@/lib/format";
import { MessageBubble } from "@/components/MessageBubble";
import { MessageComposer } from "@/components/MessageComposer";

type Props = {
  parent: Message;
  replies: Message[];
  state: WorkspaceState;
  draft: string;
  attachments: Attachment[];
  onDraftChange: (value: string) => void;
  onAttachmentsChange: (attachments: Attachment[]) => void;
  onSend: () => void;
  onClose: () => void;
  onToggleFlag: (messageId: string, flag: MessageFlag) => void;
};

export function ThreadPanel({
  parent,
  replies,
  state,
  draft,
  attachments,
  onDraftChange,
  onAttachmentsChange,
  onSend,
  onClose,
  onToggleFlag,
}: Props) {
  const author = memberById(state, parent.authorId);

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-[var(--line)] bg-[var(--surface-elevated)] shadow-[var(--shadow)] sm:w-[380px] lg:static lg:max-w-[360px] lg:shadow-none">
      <header className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
        <h2 className="font-[family-name:var(--font-source-serif)] text-sm font-semibold">
          Thread
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm text-[var(--ink-muted)] hover:bg-[var(--bg)] hover:text-[var(--ink)]"
        >
          Close
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <MessageBubble
          message={parent}
          authorName={author?.name ?? "Unknown"}
          authorInitials={author?.initials ?? "?"}
          timeLabel={formatTime(parent.createdAt)}
          onToggleFlag={(flag) => onToggleFlag(parent.id, flag)}
          compact
        />
        <div className="border-t border-[var(--line)] pt-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </p>
          <div className="space-y-4">
            {replies.map((reply) => {
              const replyAuthor = memberById(state, reply.authorId);
              return (
                <MessageBubble
                  key={reply.id}
                  message={reply}
                  authorName={replyAuthor?.name ?? "Unknown"}
                  authorInitials={replyAuthor?.initials ?? "?"}
                  timeLabel={formatTime(reply.createdAt)}
                  onToggleFlag={(flag) => onToggleFlag(reply.id, flag)}
                  compact
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--line)] p-3">
        <MessageComposer
          composerId="fireside-thread-composer"
          draft={draft}
          attachments={attachments}
          placeholder="Reply in thread… attach a file if needed"
          submitLabel="Reply"
          onDraftChange={onDraftChange}
          onAttachmentsChange={onAttachmentsChange}
          onSend={onSend}
        />
      </div>
    </aside>
  );
}
