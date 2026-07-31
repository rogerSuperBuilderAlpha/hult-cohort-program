"use client";

import { useRef, useState } from "react";
import type { Attachment } from "@/lib/types";
import {
  ATTACHMENT_ACCEPT,
  filesToAttachments,
  formatFileSize,
  kindLabel,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS_PER_MESSAGE,
} from "@/lib/attachments";
import { isIncompleteTicketSlash } from "@/lib/forth";

type Props = {
  draft: string;
  attachments: Attachment[];
  placeholder: string;
  submitLabel: string;
  composerId: string;
  onDraftChange: (value: string) => void;
  onAttachmentsChange: (attachments: Attachment[]) => void;
  onSend: () => void;
};

export function MessageComposer({
  draft,
  attachments,
  placeholder,
  submitLabel,
  composerId,
  onDraftChange,
  onAttachmentsChange,
  onSend,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const canSend = Boolean(draft.trim() || attachments.length);

  async function ingestFiles(files: FileList | File[] | null) {
    if (!files || files.length === 0) {
      return;
    }
    setBusy(true);
    const { attachments: next, errors: nextErrors } = await filesToAttachments(
      files,
      attachments.length
    );
    if (next.length) {
      onAttachmentsChange([...attachments, ...next]);
    }
    setErrors(nextErrors);
    setBusy(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment(id: string) {
    onAttachmentsChange(attachments.filter((a) => a.id !== id));
  }

  function handleSend() {
    if (!canSend || busy) return;
    if (isIncompleteTicketSlash(draft)) {
      setErrors([
        "Use /ticket Campaign name | Ticket label (pipe required).",
      ]);
      return;
    }
    setErrors([]);
    onSend();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
    >
      <div
        className={`border bg-[var(--surface-elevated)] p-2 shadow-[var(--shadow-sm)] transition ${
          dragOver
            ? "border-[var(--gold)] bg-[var(--olive-soft)]"
            : "border-[var(--line)]"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void ingestFiles(e.dataTransfer.files);
        }}
      >
        {attachments.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-2 px-1 pt-1">
            {attachments.map((att) => (
              <li
                key={att.id}
                className="flex max-w-full items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-2 py-1.5 text-xs"
              >
                {att.kind === "image" && !att.mimeType.includes("svg") && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={att.dataUrl}
                    alt=""
                    className="h-8 w-8 rounded object-cover"
                  />
                )}
                <span className="min-w-0">
                  <span className="block truncate font-medium text-[var(--ink)]">
                    {att.name}
                  </span>
                  <span className="text-[var(--ink-faint)]">
                    {kindLabel(att.kind)} · {formatFileSize(att.size)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="rounded px-1.5 py-0.5 font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                  aria-label={`Remove ${att.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="sr-only" htmlFor={composerId}>
          Message
        </label>
        <textarea
          id={composerId}
          rows={2}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onPaste={(e) => {
            const files = e.clipboardData?.files;
            if (files && files.length > 0) {
              void ingestFiles(files);
              const text = e.clipboardData.getData("text/plain");
              if (!text) e.preventDefault();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[var(--ink-faint)]"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ATTACHMENT_ACCEPT}
              className="hidden"
              onChange={(e) => void ingestFiles(e.target.files)}
            />
            <button
              type="button"
              disabled={
                busy || attachments.length >= MAX_ATTACHMENTS_PER_MESSAGE
              }
              onClick={() => fileInputRef.current?.click()}
              className="forth-btn border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-[var(--ink)] disabled:opacity-40"
            >
              {busy ? "Adding…" : "Attach file"}
            </button>
            <p className="hidden font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[var(--ink-faint)] sm:block">
              Drop, paste, or attach · max {formatFileSize(MAX_ATTACHMENT_BYTES)}{" "}
              · {MAX_ATTACHMENTS_PER_MESSAGE} files
            </p>
          </div>
          <button
            type="submit"
            disabled={!canSend || busy}
            className="forth-btn bg-[var(--accent)] px-4 py-1.5 text-[var(--sidebar-text)]"
          >
            {submitLabel}
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <ul className="mt-2 space-y-1 px-1">
          {errors.map((err) => (
            <li key={err} className="text-xs text-[var(--accent)]">
              {err}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
