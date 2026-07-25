"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AllInitiativeTasks,
  alignTasksToInitiativeSlugs,
  appendTopLevelTask,
  createDefaultTaskRows,
  deleteTaskByNumber,
  insertSubTask,
  loadInitiativeTasks,
  mergeInitiativeTaskSources,
  saveInitiativeTasks,
  sanitizeTaskField,
  TaskField,
  taskNumberExists,
} from "@/lib/initiativeTasks";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

const SAVE_DEBOUNCE_MS = 400;

interface UseInitiativeTasksOptions {
  initiativesReady: boolean;
  initiativeSlugs: string[];
}

async function fetchTasksFromApi(): Promise<AllInitiativeTasks | null> {
  const response = await fetch("/api/dashboard/tasks", { cache: "no-store" });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load tasks from server.");
  }

  const data = (await response.json()) as { tasks?: AllInitiativeTasks };
  return data.tasks ?? {};
}

async function saveTasksToApi(tasks: AllInitiativeTasks): Promise<void> {
  const response = await fetch("/api/dashboard/tasks", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tasks),
  });

  if (!response.ok) {
    throw new Error("Failed to save tasks to server.");
  }
}

export function useInitiativeTasks(options: UseInitiativeTasksOptions) {
  const { initiativesReady, initiativeSlugs } = options;
  const { userId, isAuthLoaded } = useSupabaseUser();
  const [tasksByInitiative, setTasksByInitiative] = useState<AllInitiativeTasks>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const skipNextSave = useRef(true);
  const canSaveRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tasksRef = useRef(tasksByInitiative);
  const userIdRef = useRef(userId);

  tasksRef.current = tasksByInitiative;
  userIdRef.current = userId;

  useEffect(() => {
    if (!isAuthLoaded || !initiativesReady) {
      return;
    }

    let cancelled = false;

    async function loadTasks() {
      canSaveRef.current = false;
      setIsLoaded(false);

      const local = loadInitiativeTasks();

      if (userId) {
        try {
          const remote = await fetchTasksFromApi();

          if (remote !== null) {
            let merged = mergeInitiativeTaskSources(remote, local);

            if (initiativeSlugs.length > 0) {
              const beforeAlign = JSON.stringify(merged);
              merged = alignTasksToInitiativeSlugs(initiativeSlugs, merged);
              if (JSON.stringify(merged) !== beforeAlign) {
                saveInitiativeTasks(merged);
                void saveTasksToApi(merged).catch((error) => {
                  console.error("Failed to realign task slugs on server:", error);
                });
              }
            }

            if (!cancelled) {
              setTasksByInitiative(merged);
              skipNextSave.current = true;
              canSaveRef.current = true;
              setIsLoaded(true);
            }
            return;
          }
        } catch (error) {
          console.error("Failed to load initiative tasks from API:", error);
        }
      }

      if (!cancelled) {
        setTasksByInitiative(local);
        skipNextSave.current = true;
        canSaveRef.current = true;
        setIsLoaded(true);
      }
    }

    void loadTasks();

    return () => {
      cancelled = true;
    };
  }, [userId, isAuthLoaded, initiativesReady, initiativeSlugs.join("|")]);

  const flushSave = useCallback(() => {
    if (!canSaveRef.current) {
      return;
    }

    const currentUserId = userIdRef.current;
    const payload = tasksRef.current;

    saveInitiativeTasks(payload);

    if (currentUserId) {
      void saveTasksToApi(payload).catch((error) => {
        console.error("Failed to save initiative tasks to API:", error);
      });
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(flushSave, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [tasksByInitiative, isLoaded, flushSave]);

  useEffect(() => {
    const handlePageHide = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      flushSave();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handlePageHide();
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [flushSave]);

  const seedInitiativeTasks = useCallback((initiativeSlug: string) => {
    setTasksByInitiative((current) => {
      if (current[initiativeSlug]) {
        return current;
      }

      skipNextSave.current = true;

      return {
        ...current,
        [initiativeSlug]: createDefaultTaskRows(),
      };
    });
  }, []);

  const updateTaskField = useCallback(
    (initiativeSlug: string, rowId: string, field: TaskField, value: string) => {
      const sanitizedValue = sanitizeTaskField(field, value);

      setTasksByInitiative((current) => {
        if (!current[initiativeSlug]) {
          return current;
        }

        const rows = current[initiativeSlug];
        const rowIndex = rows.findIndex((row) => row.id === rowId);
        if (rowIndex === -1) {
          return current;
        }

        const row = rows[rowIndex];
        if (row[field] === sanitizedValue) {
          return current;
        }

        const nextRows = [...rows];
        nextRows[rowIndex] = {
          ...row,
          [field]: sanitizedValue,
        };

        return {
          ...current,
          [initiativeSlug]: nextRows,
        };
      });
    },
    []
  );

  const addTaskRow = useCallback((initiativeSlug: string) => {
    setTasksByInitiative((current) => {
      const rows = current[initiativeSlug] ?? createDefaultTaskRows();

      return {
        ...current,
        [initiativeSlug]: appendTopLevelTask(rows),
      };
    });
  }, []);

  const addSubTaskRow = useCallback((initiativeSlug: string, parentTaskNumber: string) => {
    setTasksByInitiative((current) => {
      const rows = current[initiativeSlug];
      if (!rows || !taskNumberExists(rows, parentTaskNumber)) {
        return current;
      }

      return {
        ...current,
        [initiativeSlug]: insertSubTask(rows, parentTaskNumber),
      };
    });
  }, []);

  const deleteTaskRow = useCallback((initiativeSlug: string, taskNumber: string) => {
    const trimmedTaskNumber = taskNumber.trim();
    if (!trimmedTaskNumber) {
      return false;
    }

    let deleted = false;

    setTasksByInitiative((current) => {
      const rows = current[initiativeSlug];
      if (!rows) {
        return current;
      }

      const nextRows = deleteTaskByNumber(rows, trimmedTaskNumber);
      if (!nextRows) {
        return current;
      }

      deleted = true;
      return {
        ...current,
        [initiativeSlug]: nextRows,
      };
    });

    return deleted;
  }, []);

  const removeInitiativeTasks = useCallback((initiativeSlug: string) => {
    const trimmedSlug = initiativeSlug.trim();
    if (!trimmedSlug) {
      return false;
    }

    const current = tasksRef.current;
    if (!(trimmedSlug in current)) {
      return false;
    }

    const next = { ...current };
    delete next[trimmedSlug];
    setTasksByInitiative(next);

    saveInitiativeTasks(next);

    const currentUserId = userIdRef.current;
    if (currentUserId) {
      void saveTasksToApi(next).catch((error) => {
        console.error("Failed to save initiative tasks to API:", error);
      });
    }

    return true;
  }, []);

  return {
    tasksByInitiative,
    isLoaded: isLoaded && isAuthLoaded && initiativesReady,
    seedInitiativeTasks,
    updateTaskField,
    addTaskRow,
    addSubTaskRow,
    deleteTaskRow,
    removeInitiativeTasks,
  };
}
