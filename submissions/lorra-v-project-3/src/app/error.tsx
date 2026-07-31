"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-start justify-center gap-4 px-6 py-16">
      <p className="text-xs uppercase tracking-[0.16em] text-foreground-muted">
        Something stalled
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        We couldn’t load that page
      </h1>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Try again in a moment. If it keeps happening, refresh or head back to
        the home page.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <a href="/">
          <Button type="button" variant="secondary">
            Go home
          </Button>
        </a>
      </div>
    </div>
  );
}
