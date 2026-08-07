"use client";

import { useEffect } from "react";

type Props = {
  event: "lesson_started" | "lesson_completed" | "quiz_submitted" | "session_heartbeat";
  properties?: Record<string, string | number | boolean | null>;
  intervalMs?: number;
};

export function EventTracker({ event, properties = {}, intervalMs }: Props) {
  useEffect(() => {
    const fire = () =>
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: event, properties }),
      }).catch(() => {});

    fire();
    if (intervalMs) {
      const id = setInterval(fire, intervalMs);
      return () => clearInterval(id);
    }
  }, [event, intervalMs, properties]);

  return null;
}