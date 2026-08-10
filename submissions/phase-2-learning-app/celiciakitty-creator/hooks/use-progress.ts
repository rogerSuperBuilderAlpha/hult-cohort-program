"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { ModuleId, ModuleProgress } from "@/lib/course/types";
import {
  DEFAULT_PROGRESS,
  PROGRESS_CHANGE_EVENT,
  PROGRESS_STORAGE_KEY,
  markLessonComplete,
  markQuizComplete,
  parseProgress,
  updateModuleProgress,
} from "@/lib/progress/storage";

const SERVER_SNAPSHOT = DEFAULT_PROGRESS;

let cachedRaw: string | null | undefined;
let cachedSnapshot = SERVER_SNAPSHOT;

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function getClientSnapshot() {
  const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);

  if (raw === cachedRaw) {
    return cachedSnapshot;
  }

  cachedRaw = raw;
  cachedSnapshot = parseProgress(raw);
  return cachedSnapshot;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PROGRESS_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PROGRESS_CHANGE_EVENT, onStoreChange);
  };
}

function getHydratedClientSnapshot() {
  return true;
}

function getHydratedServerSnapshot() {
  return false;
}

export function useProgress() {
  const progress = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const hydrated = useSyncExternalStore(
    subscribe,
    getHydratedClientSnapshot,
    getHydratedServerSnapshot
  );

  const refresh = useCallback(() => {
    window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
  }, []);

  const completeLesson = useCallback((moduleId: ModuleId) => {
    markLessonComplete(moduleId);
  }, []);

  const completeQuiz = useCallback(
    (moduleId: ModuleId, score: number, total: number) => {
      markQuizComplete(moduleId, score, total);
    },
    []
  );

  const touchModule = useCallback(
    (moduleId: ModuleId, patch: Partial<ModuleProgress>) => {
      updateModuleProgress(moduleId, patch);
    },
    []
  );

  return {
    progress,
    hydrated,
    refresh,
    completeLesson,
    completeQuiz,
    touchModule,
  };
}
