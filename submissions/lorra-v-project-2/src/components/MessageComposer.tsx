"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  sendParentMessage,
  uploadAttachment,
  type MessageParentType,
} from "@/app/(app)/messaging/actions";

type Member = { id: string; display_name: string };

export function MessageComposer({
  parentType,
  parentId,
  pathKey,
  placeholder,
  members,
  adminPostOnly = false,
  isAdmin = false,
  onSent,
}: {
  parentType: MessageParentType;
  parentId: string;
  pathKey: string;
  placeholder: string;
  members: Member[];
  adminPostOnly?: boolean;
  isAdmin?: boolean;
  onSent: () => void;
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<
    {
      file_url: string;
      file_name: string;
      mime_type: string;
      size_bytes: number;
    }[]
  >([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canPost = !adminPostOnly || isAdmin;

  const mentionOptions = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return members
      .filter((m) => m.display_name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [mentionQuery, members]);

  function wrapSelection(prefix: string, suffix = prefix) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = body.slice(start, end) || "text";
    const next =
      body.slice(0, start) + prefix + selected + suffix + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length,
      );
    });
  }

  function onChangeBody(value: string) {
    setBody(value);
    const el = textareaRef.current;
    if (!el) return;
    const cursor = el.selectionStart;
    const before = value.slice(0, cursor);
    const match = before.match(/@([^\s@]*)$/);
    setMentionQuery(match ? match[1] : null);
  }

  function insertMention(member: Member) {
    const el = textareaRef.current;
    if (!el) return;
    const cursor = el.selectionStart;
    const before = body.slice(0, cursor);
    const after = body.slice(cursor);
    const replaced = before.replace(/@([^\s@]*)$/, `@${member.display_name} `);
    setBody(replaced + after);
    setMentionQuery(null);
    requestAnimationFrame(() => el.focus());
  }

  async function onPickFile(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError(null);
    try {
      for (const file of Array.from(fileList)) {
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function send() {
    if (!canPost) return;
    if (!body.trim() && pendingFiles.length === 0) return;
    setError(null);
    startTransition(async () => {
      try {
        await sendParentMessage({
          parentType,
          parentId,
          pathKey,
          body: body.trim(),
          memberProfiles: members,
          files: pendingFiles,
        });
        setBody("");
        setPendingFiles([]);
        setMentionQuery(null);
        onSent();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Send failed");
      }
    });
  }

  if (!canPost) {
    return (
      <div
        data-testid="composer-readonly"
        className="rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_20%,transparent)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-secondary)]"
      >
        Only admins can post in #announcements.
      </div>
    );
  }

  return (
    <div data-testid="message-composer" className="relative">
      <div className="mb-2 flex flex-wrap gap-1">
        <button
          type="button"
          className="rounded px-2 py-1 text-xs font-semibold text-[var(--color-secondary)] hover:bg-[var(--color-bg)]"
          onClick={() => wrapSelection("**")}
        >
          Bold
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs font-semibold text-[var(--color-secondary)] hover:bg-[var(--color-bg)]"
          onClick={() => wrapSelection("*")}
        >
          Italic
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs font-semibold text-[var(--color-secondary)] hover:bg-[var(--color-bg)]"
          onClick={() => wrapSelection("`")}
        >
          Code
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs font-semibold text-[var(--color-secondary)] hover:bg-[var(--color-bg)]"
          onClick={() => wrapSelection("[", "](https://)")}
        >
          Link
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs font-semibold text-[var(--color-secondary)] hover:bg-[var(--color-bg)]"
          onClick={() => {
            const el = textareaRef.current;
            if (!el) return;
            const start = el.selectionStart;
            const next = `${body.slice(0, start)}\n- ${body.slice(start)}`;
            setBody(next);
          }}
        >
          List
        </button>
      </div>

      <div className="flex items-end gap-2 rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_22%,transparent)] bg-[var(--color-surface)] px-3 py-2">
        <div className="flex gap-1 pb-1">
          <button
            type="button"
            title="Attach file"
            data-testid="composer-attach"
            className="rounded px-1.5 text-sm text-[var(--color-secondary)] hover:bg-[var(--color-bg)]"
            onClick={() => fileRef.current?.click()}
          >
            +
          </button>
          <button
            type="button"
            title="Mention"
            data-testid="composer-mention"
            className="rounded px-1.5 text-sm text-[var(--color-secondary)] hover:bg-[var(--color-bg)]"
            onClick={() => {
              setBody((b) => `${b}@`);
              setMentionQuery("");
              textareaRef.current?.focus();
            }}
          >
            @
          </button>
        </div>
        <textarea
          ref={textareaRef}
          data-testid="composer-input"
          value={body}
          rows={2}
          placeholder={placeholder}
          className="min-h-[44px] flex-1 resize-none bg-transparent py-2 text-sm text-[var(--color-dark)] outline-none"
          onChange={(e) => onChangeBody(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          type="button"
          data-testid="composer-send"
          disabled={pending}
          onClick={send}
          className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white disabled:opacity-60"
          aria-label="Send message"
        >
          →
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.docx,.zip"
        multiple
        onChange={(e) => onPickFile(e.target.files)}
      />

      {pendingFiles.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {pendingFiles.map((f) => (
            <li
              key={f.file_url}
              className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs text-[var(--color-secondary)]"
            >
              {f.file_name}
              <button
                type="button"
                className="ml-2 text-[var(--color-danger)]"
                onClick={() =>
                  setPendingFiles((prev) => prev.filter((p) => p.file_url !== f.file_url))
                }
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {mentionOptions.length > 0 ? (
        <ul
          data-testid="mention-typeahead"
          className="absolute bottom-full left-0 z-10 mb-2 w-64 overflow-hidden rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--color-secondary)_20%,transparent)] bg-[var(--color-surface)] shadow-md"
        >
          {mentionOptions.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-bg)]"
                onClick={() => insertMention(m)}
              >
                @{m.display_name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <p className="mt-2 text-xs text-[var(--color-danger)]" data-testid="composer-error">
          {error}
        </p>
      ) : (
        <p className="mt-2 text-xs text-[var(--color-secondary)]">
          Cmd/Ctrl+Enter to send · Markdown: **bold** *italic* `code`
        </p>
      )}
    </div>
  );
}
