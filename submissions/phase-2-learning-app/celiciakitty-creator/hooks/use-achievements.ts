"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  ACHIEVEMENTS_CHANGE_EVENT,
  ACHIEVEMENTS_STORAGE_KEY,
  DEFAULT_ACHIEVEMENTS,
  readAchievements,
  type AchievementsState,
} from "@/lib/achievements";
import { PROGRESS_CHANGE_EVENT } from "@/lib/progress/storage";

const SERVER_SNAPSHOT = DEFAULT_ACHIEVEMENTS;

let cachedRaw: string | null | undefined;
let cachedSnapshot = SERVER_SNAPSHOT;

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function getClientSnapshot() {
  const raw = window.localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);

  if (raw === cachedRaw) {
    return cachedSnapshot;
  }

  cachedRaw = raw;
  cachedSnapshot = readAchievements();
  return cachedSnapshot;
}

function subscribe(onStoreChange: () => void) {
  const handleChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(PROGRESS_CHANGE_EVENT, handleChange);
  window.addEventListener(ACHIEVEMENTS_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(PROGRESS_CHANGE_EVENT, handleChange);
    window.removeEventListener(ACHIEVEMENTS_CHANGE_EVENT, handleChange);
  };
}

export function useAchievements() {
  const achievements: AchievementsState = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const refresh = useCallback(() => {
    window.dispatchEvent(new Event(ACHIEVEMENTS_CHANGE_EVENT));
  }, []);

  return { achievements, refresh };
}
