"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types";
import { openThread, sendThreadReply } from "@/app/(app)/threads/actions";
import { uploadAttachment, type MessageParentType } from "@/app/(app)/messaging/actions";
import { MessageItem } from "@/components/MessageItem";
import { formatMessageHtml } from "@/lib/format";

type Member = { id: string; display_name: string };

export function ThreadPanel({
  threadRootId,
  parentType,
  pathKey,
  parentLabel,
  members,
  currentUser,
  onClose,
  onChanged,
}: {
  threadRootId: string;
  parentType: MessageParentType;
  pathKey: string;
  parentLabel: string;
  members: Member[];
  currentUser: { id: string; role: string };
  onClose: () => void;
  onChanged: () => void;
}) {
  const [root, setRoot] = useState<Message | null>(null);
  const [replies, setReplies] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [alsoSend, setAlsoSend] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<
    {
      file_url: string;
      file_name: string;
      mime_type: string;
      size_bytes: number;
    }[]
  >([]);
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const opened = await openThread(threadRootId);
      setRoot(opened.root);
      setReplies(opened.replies);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load thread");
    }
  }, [threadRootId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies.length]);

  useEffect(() => {
    const supabase = createClient();
    const sub = supabase
      .channel(`thread:${threadRootId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `thread_root_id=eq.${threadRootId}`,
        },
        () => {
          void refresh();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(sub);
    };
  }, [threadRootId, refresh]);

  function send() {
    if (!body.trim() && pendingFiles.length === 0) return;
    setError(null);
    startTransition(async () => {
      try {
        await sendThreadReply({
          threadRootId,
          body: body.trim(),
          pathKey,
          memberProfiles: members,
          alsoSendToParent: alsoSend,
          files: pendingFiles,
        });
        setBody("");
        setPendingFiles([]);
        setAlsoSend(false);
        await refresh();
        onChanged();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Reply failed");
      }
    });
  }

  const rootAuthor = root
    ? Array.isArray(root.profiles)
      ? root.profiles[0]
      : root.profiles
    : null;

  return (
    <aside
      data-testid="thread-panel"
      className="fixed inset-0 z-40 flex flex-col bg-[var(--color-surface)] md:static md:z-0 md:w-[22rem] md:shrink-0 md:rounded-[var(--radius-card)] lg:w-96"
    >
      <header className="flex items-start justify-between gap-2 border-b border-[color-mix(in_srgb,var(--color-secondary)_15%,transparent)] px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--color-primary)]">Thread</p>
          <h2 className="truncate text-lg font-semibold text-[var(--color-dark)]">
            {parentLabel}
          </h2>
          <p className="text-xs text-[var(--color-secondary)]">
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </p>
        </div>
        <button
          type="button"
          data-testid="thread-close"
          onClick={onClose}
          className="rounded-[var(--radius-button)] px-2 py-1 text-sm text-[var(--color-secondary)] hover:bg-[var(--color-bg)]"
        >
          Close
        </button>
      </header>

      <div className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {root ? (
          <article
            data-testid="thread-root"
            className="rounded-[var(--radius-card)] bg-[var(--color-bg)] px-3 py-3"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-[var(--color-dark)]">
                {rootAuthor?.display_name || "Unknown"}
              </span>
              <span className="text-xs text-[var(--color-secondary)]">
                {new Date(root.created_at).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div
              className="mt-1 text-sm leading-relaxed text-[var(--color-dark)] [&_a]:text-[var(--color-primary)]"
              dangerouslySetInnerHTML={{
                __html: formatMessageHtml(root.body_richtext),
              }}
            />
          </article>
        ) : (
          <p className="px-3 py-4 text-sm text-[var(--color-secondary)]">Loading thread…</p>
        )}

        {replies.map((m) => (
          <MessageItem
            key={m.id}
            message={m}
            currentUser={currentUser}
            parentType={parentType}
            pathKey={pathKey}
            onChanged={() => void refresh()}
            compact
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[color-mix(in_srgb,var(--color-secondary)_15%,transparent)] p-3">
        {error ? (
          <p className="mb-2 text-xs text-[var(--color-danger)]" data-testid="thread-error">
            {error}
          </p>
        ) : null}
        <textarea
          data-testid="thread-reply-input"
          value={body}
          rows={2}
          placeholder="Reply in thread…"
          className="w-full resize-none rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_22%,transparent)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none"
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              send();
            }
          }}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs text-[var(--color-secondary)]">
            <input
              type="checkbox"
              data-testid="thread-also-send"
              checked={alsoSend}
              onChange={(e) => setAlsoSend(e.target.checked)}
            />
            Also send to {parentType === "channel" ? "channel" : "conversation"}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded px-2 py-1 text-xs text-[var(--color-secondary)] hover:bg-[var(--color-bg)]"
              onClick={() => fileRef.current?.click()}
            >
              Attach
            </button>
            <button
              type="button"
              data-testid="thread-reply-send"
              disabled={pending}
              onClick={send}
              className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              Reply
            </button>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.docx,.zip"
          multiple
          onChange={async (e) => {
            const files = e.target.files;
            if (!files?.length) return;
            try {
              for (const file of Array.from(files)) {
                const fd = new FormData();
                fd.set("file", file);
                const uploaded = await uploadAttachment(fd);
                setPendingFiles((prev) => [
                  ...prev,
                  {
                    file_url: uploaded.file_url,
                    file_name: uploaded.file_name,
                    mime_type: uploaded.mime_type,
                    size_bytes: uploaded.size_bytes,
                  },
                ]);
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : "Upload failed");
            } finally {
              if (fileRef.current) fileRef.current.value = "";
            }
          }}
        />
        {pendingFiles.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs text-[var(--color-secondary)]">
            {pendingFiles.map((f) => (
              <li key={f.file_url}>{f.file_name}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </aside>
  );
}
