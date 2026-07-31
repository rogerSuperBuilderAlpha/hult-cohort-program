"use client";

import type { Attachment } from "@/lib/types";
import { formatFileSize, kindLabel } from "@/lib/attachments";

type Props = {
  attachments: Attachment[];
  compact?: boolean;
};

function isVisual(att: Attachment) {
  // Only raster images — never render SVG/data drawings as <img> (XSS risk).
  return att.kind === "image" && !att.mimeType.includes("svg");
}

export function MessageAttachments({ attachments, compact = false }: Props) {
  if (!attachments.length) return null;

  return (
    <div className={`mt-2 space-y-2 ${compact ? "max-w-full" : "max-w-md"}`}>
      {attachments.map((att) =>
        isVisual(att) ? (
          <a
            key={att.id}
            href={att.dataUrl}
            download={att.name}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-elevated)] transition hover:border-[var(--accent)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={att.dataUrl}
              alt={att.name}
              className={`w-full object-contain bg-[var(--bg)] ${
                compact ? "max-h-40" : "max-h-72"
              }`}
            />
            <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-[var(--ink-muted)]">
              <span className="truncate font-medium text-[var(--ink)]">
                {att.name}
              </span>
              <span className="shrink-0">
                {kindLabel(att.kind)} · {formatFileSize(att.size)}
              </span>
            </div>
          </a>
        ) : att.kind === "audio" ? (
          <div
            key={att.id}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface-elevated)] px-3 py-2"
          >
            <p className="mb-1 truncate text-xs font-medium text-[var(--ink)]">
              {att.name}
            </p>
            <audio controls src={att.dataUrl} className="w-full" />
          </div>
        ) : att.kind === "video" ? (
          <div
            key={att.id}
            className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-elevated)]"
          >
            <video
              controls
              src={att.dataUrl}
              className={`w-full bg-black ${compact ? "max-h-40" : "max-h-64"}`}
            />
            <div className="px-3 py-2 text-xs text-[var(--ink-muted)]">
              <span className="font-medium text-[var(--ink)]">{att.name}</span>
              {" · "}
              {formatFileSize(att.size)}
            </div>
          </div>
        ) : (
          <a
            key={att.id}
            href={att.dataUrl}
            download={att.name}
            className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-elevated)] px-3 py-2.5 transition hover:border-[var(--accent)]"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--warm-soft)] text-[10px] font-bold uppercase text-[var(--warm)]"
              aria-hidden
            >
              {att.kind === "pdf" ? "PDF" : "DOC"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[var(--ink)]">
                {att.name}
              </span>
              <span className="text-xs text-[var(--ink-faint)]">
                {kindLabel(att.kind)} · {formatFileSize(att.size)} · Download
              </span>
            </span>
          </a>
        )
      )}
    </div>
  );
}
