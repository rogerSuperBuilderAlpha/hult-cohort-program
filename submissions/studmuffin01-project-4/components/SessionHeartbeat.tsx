"use client";

import { useEffect } from "react";

/** Fires session_heartbeat every 60s while the learner keeps a page open. */
export function SessionHeartbeat({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      void fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "session_heartbeat" }),
      }).catch(() => {});
    };

    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [enabled]);

  return null;
}
