"use client";

import { useMemo, useState } from "react";
import type { FileRow } from "@/app/(app)/files/actions";
import { EmptyState } from "@/components/EmptyState";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilesView({
  initial,
  channels,
}: {
  initial: FileRow[];
  channels: { id: string; name: string }[];
}) {
  const [channelId, setChannelId] = useState("all");

  const filtered = useMemo(() => {
    if (channelId === "all") return initial;
    if (channelId === "dms") {
      return initial.filter((f) => f.parent_type === "conversation");
    }
    return initial.filter((f) => f.channel_id === channelId);
  }, [initial, channelId]);

  return (
    <section
      data-testid="files-page"
      className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 md:p-8"
    >
      <h1 className="text-2xl font-semibold text-[var(--color-dark)]">Files</h1>
      <p className="mt-2 text-sm text-[var(--color-secondary)]">
        Attachments you can see, filterable by channel.
      </p>

      <label className="mt-5 block text-xs font-medium text-[var(--color-secondary)]">
        Channel
        <select
          data-testid="files-filter-channel"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          className="mt-1 block rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] px-2 py-1.5 text-sm text-[var(--color-dark)]"
        >
          <option value="all">All</option>
          <option value="dms">Direct messages</option>
          {channels.map((c) => (
            <option key={c.id} value={c.id}>
              #{c.name}
            </option>
          ))}
        </select>
      </label>

      <div data-testid="files-list" className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            testId="files-empty"
            title={initial.length === 0 ? "No attachments yet" : "No files in this filter"}
            description="Attach an image, PDF, docx, or zip from a channel or DM composer."
          />
        ) : (
          <ul className="space-y-2">
            {filtered.map((f) => (
              <li key={f.id}>
                <a
                  href={f.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="file-row"
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--color-secondary)_18%,transparent)] px-4 py-3 no-underline hover:border-[var(--color-primary)]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-dark)]">
                      {f.file_name}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-secondary)]">
                      {f.channel_name
                        ? `#${f.channel_name}`
                        : f.parent_type === "conversation"
                          ? "DM"
                          : "Message"}{" "}
                      · {formatBytes(f.size_bytes)} · {f.mime_type}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
