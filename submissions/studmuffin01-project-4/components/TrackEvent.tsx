"use client";

import { useEffect, useRef } from "react";

type Props = {
  event: "lesson_started" | "lesson_completed" | "quiz_submitted";
  metadata?: Record<string, unknown>;
};

/** Fires a learning event once on mount (best-effort). */
export function TrackEvent({ event, metadata }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, metadata }),
    }).catch(() => {
      /* ignore — dry-run / offline during scaffold */
    });
  }, [event, metadata]);

  return null;
}
