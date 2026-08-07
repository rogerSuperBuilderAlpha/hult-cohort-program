"use client";

import { useEffect, useRef } from "react";
import { sendHeartbeat } from "@/app/paths/actions";

const HEARTBEAT_MS = 120_000;

/**
 * Fires session_heartbeat ~every 120s while the tab is visible.
 * Pauses when document.visibilityState !== "visible".
 */
export function SessionHeartbeat({
  disciplineId,
  sessionId,
}: {
  disciplineId: string;
  sessionId: string;
}) {
  const tickRef = useRef(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const clear = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      clear();
      timer = setInterval(() => {
        if (document.visibilityState !== "visible") return;
        tickRef.current += 1;
        void sendHeartbeat(disciplineId, sessionId);
      }, HEARTBEAT_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        start();
      } else {
        clear();
      }
    };

    if (document.visibilityState === "visible") {
      start();
    }

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clear();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [disciplineId, sessionId]);

  return null;
}
