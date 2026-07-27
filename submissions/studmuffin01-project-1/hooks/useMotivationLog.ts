"use client";

import { useCallback, useEffect, useState } from "react";
import {
  appendMotivationLogEntry,
  loadMotivationLog,
  saveMotivationLog,
  type MotivationLogEntry,
  type NewMotivationLogEntry,
} from "@/lib/motivationLog";

export function useMotivationLog() {
  const [entries, setEntries] = useState<MotivationLogEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setEntries(loadMotivationLog());
    setIsLoaded(true);
  }, []);

  const logMessage = useCallback((input: NewMotivationLogEntry) => {
    setEntries((current) => {
      const next = appendMotivationLogEntry(current, input);
      saveMotivationLog(next);
      return next;
    });
  }, []);

  return {
    entries,
    isLoaded,
    logMessage,
  };
}
