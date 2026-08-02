"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setContentStatusAction,
  updateCampaignContentAction,
} from "@/app/dashboard/copilot/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  CHANNEL_LABELS,
  type CampaignContent,
  type ContentStatus,
} from "@/lib/types/campaign";

type Props = {
  content: CampaignContent;
};

function statusTone(
  status: ContentStatus,
): "accent" | "projects" | "muted" | "coral" | "default" {
  switch (status) {
    case "approved":
      return "projects";
    case "edited":
      return "accent";
    case "rejected":
      return "coral";
    default:
      return "muted";
  }
}

export function CampaignContentCard({ content }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState(content.content);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savePending, startSave] = useTransition();
  const [statusPending, startStatus] = useTransition();

  const dirty = draft.trim() !== content.content.trim();
  const busy = savePending || statusPending;

  function refreshAfter(
    result: { error?: string; success?: string } | null,
  ) {
    if (result?.error) {
      setError(result.error);
      setMessage(null);
      return;
    }
    setError(null);
    setMessage(result?.success ?? null);
    router.refresh();
  }

  return (
    <article className="space-y-4 rounded-xl border border-border bg-background-elevated p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold">
          {CHANNEL_LABELS[content.channel]}
        </h3>
        <Badge tone={statusTone(content.status)}>{content.status}</Badge>
      </div>

      <Textarea
        aria-label={`${CHANNEL_LABELS[content.channel]} copy`}
        rows={content.channel === "partner_summary" ? 8 : 10}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={busy}
      />

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-accent" role="status">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy || !dirty || !draft.trim()}
          onClick={() => {
            startSave(async () => {
              const result = await updateCampaignContentAction(
                content.id,
                draft,
              );
              refreshAfter(result);
            });
          }}
        >
          {savePending ? "Saving…" : "Save edit"}
        </Button>

        <Button
          type="button"
          size="sm"
          accent="projects"
          disabled={busy || content.status === "approved" || !draft.trim()}
          onClick={() => {
            startStatus(async () => {
              if (dirty) {
                const saved = await updateCampaignContentAction(
                  content.id,
                  draft,
                );
                if (saved?.error) {
                  refreshAfter(saved);
                  return;
                }
              }
              const result = await setContentStatusAction(
                content.id,
                "approved",
              );
              refreshAfter(result);
            });
          }}
        >
          {statusPending && content.status !== "approved"
            ? "Approving…"
            : "Approve"}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy || content.status === "rejected"}
          onClick={() => {
            startStatus(async () => {
              const result = await setContentStatusAction(
                content.id,
                "rejected",
              );
              refreshAfter(result);
            });
          }}
        >
          Reject
        </Button>

        {content.status === "approved" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(content.content);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
              } catch {
                setError("Couldn’t copy — select the text manually.");
              }
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
