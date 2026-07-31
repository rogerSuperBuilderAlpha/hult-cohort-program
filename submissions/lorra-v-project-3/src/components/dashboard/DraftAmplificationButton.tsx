"use client";

import { useState, useTransition } from "react";
import { draftAmplificationAction } from "@/app/dashboard/amplify/actions";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type Props = {
  campaignId: string;
  label?: string;
  size?: "sm" | "md" | "lg";
};

export function DraftAmplificationButton({
  campaignId,
  label = "Draft endorsement",
  size = "md",
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {pending ? (
        <div className="relative overflow-hidden rounded-xl border border-accent-builders/40 bg-background-elevated px-5 py-7">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at 25% 40%, color-mix(in oklab, var(--accent-builders) 40%, transparent), transparent 55%), radial-gradient(ellipse at 80% 70%, color-mix(in oklab, var(--accent) 20%, transparent), transparent 50%)",
            }}
            aria-hidden
          />
          <div className="relative space-y-2">
            <Spinner
              label="Writing a peer endorsement…"
              className="text-foreground"
            />
            <p className="max-w-md text-sm text-foreground-muted">
              Grounding the boost in your voice and their campaign evidence —
              without inventing a backstory.
            </p>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          accent="builders"
          size={size}
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await draftAmplificationAction(campaignId);
              if (result?.error) setError(result.error);
            });
          }}
        >
          {label}
        </Button>
      )}
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
