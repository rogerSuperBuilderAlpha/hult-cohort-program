"use client";

import { useEffect, useRef } from "react";

export function SessionHeartbeat() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const tick = () => {
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "session_heartbeat" }),
      });
    };

    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}

export async function track(
  event: "lesson_started" | "lesson_completed" | "quiz_submitted",
  metadata?: Record<string, unknown>,
) {
  const res = await fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, metadata }),
  });
  return res.json();
}
