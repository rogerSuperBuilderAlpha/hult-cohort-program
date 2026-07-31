"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  shareAmplificationAction,
  updateAmplificationAction,
} from "@/app/dashboard/amplify/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import type { Amplification } from "@/lib/types/amplification";

type Props = {
  amplification: Amplification;
};

export function AmplificationEditor({ amplification }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState(amplification.content);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savePending, startSave] = useTransition();
  const [sharePending, startShare] = useTransition();

  const shared = amplification.status === "shared";
  const dirty = draft.trim() !== amplification.content.trim();
  const busy = savePending || sharePending;

  useEffect(() => {
    setDraft(amplification.content);
  }, [amplification.id, amplification.content]);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-background-elevated p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">Your endorsement</h2>
        <Badge tone={shared ? "builders" : "muted"}>
          {amplification.status}
        </Badge>
      </div>

      <Textarea
        aria-label="Endorsement draft"
        rows={10}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setMessage(null);
          setError(null);
        }}
        disabled={busy || shared}
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

      <div className="relative z-10 flex flex-wrap gap-2">
        {!shared ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy || !draft.trim()}
              aria-disabled={busy || !draft.trim()}
              onClick={() => {
                if (!draft.trim()) {
                  setError("Endorsement can’t be empty.");
                  setMessage(null);
                  return;
                }
                if (!dirty) {
                  setError(null);
                  setMessage("No changes to save yet — edit the text first.");
                  return;
                }

                startSave(async () => {
                  const result = await updateAmplificationAction(
                    amplification.id,
                    draft,
                  );
                  if (result?.error) {
                    setError(result.error);
                    setMessage(null);
                    return;
                  }
                  setError(null);
                  setMessage(result?.success ?? "Draft saved.");
                  router.refresh();
                });
              }}
            >
              {savePending ? "Saving…" : "Save draft"}
            </Button>

            <Button
              type="button"
              accent="builders"
              size="sm"
              disabled={busy || !draft.trim()}
              onClick={() => {
                startShare(async () => {
                  let didCopy = false;
                  try {
                    await navigator.clipboard.writeText(draft.trim());
                    didCopy = true;
                    setCopied(true);
                  } catch {
                    setCopied(false);
                  }

                  const result = await shareAmplificationAction(
                    amplification.id,
                    draft,
                  );
                  if (result?.error) {
                    setError(result.error);
                    setMessage(null);
                    return;
                  }
                  setError(null);
                  setMessage(
                    didCopy
                      ? "Copied and marked shared — paste it wherever you post."
                      : "Marked shared. Copy the text manually if needed.",
                  );
                  router.refresh();
                });
              }}
            >
              {sharePending ? "Sharing…" : "Copy & mark shared"}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(amplification.content);
                setCopied(true);
                setMessage("Copied again.");
                window.setTimeout(() => setCopied(false), 1600);
              } catch {
                setError("Couldn’t copy — select the text manually.");
              }
            }}
          >
            {copied ? "Copied" : "Copy again"}
          </Button>
        )}
      </div>
    </div>
  );
}
