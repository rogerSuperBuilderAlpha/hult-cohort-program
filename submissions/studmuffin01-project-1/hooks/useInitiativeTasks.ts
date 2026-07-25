"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AllInitiativeTasks,
  appendTopLevelTask,
  createDefaultTaskRows,
  deleteTaskByNumber,
  getInitiativeTasks,
  insertSubTask,
  loadInitiativeTasks,
  parseInitiativeTasks,
  saveInitiativeTasks,
  sanitizeTaskField,
  TaskField,
  taskNumberExists,
} from "@/lib/initiativeTasks";
import { createClient } from "@/lib/supabase/client";
import {
  fetchUserAppData,
  upsertUserAppData,
  USER_DATA_KEYS,
} from "@/lib/supabase/userDataRepository";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

const SAVE_DEBOUNCE_MS = 400;

export function useInitiativeTasks() {
  const { userId, isAuthLoaded } = useSupabaseUser();
  const [tasksByInitiative, setTasksByInitiative] = useState<AllInitiativeTasks>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const skipNextSave = useRef(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tasksRef = useRef(tasksByInitiative);
  const userIdRef = useRef(userId);

  tasksRef.current = tasksByInitiative;
  userIdRef.current = userId;

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    let cancelled = false;

    async function loadTasks() {
      setIsLoaded(false);

      if (userId) {
        try {
          const supabase = createClient();
          const remote = await fetchUserAppData(
            supabase,
            userId,
            USER_DATA_KEYS.initiativeTasks,
            parseInitiativeTasks
          );

          if (remote && Object.keys(remote).length > 0) {
            if (!cancelled) {
              setTasksByInitiative(remote);
              skipNextSave.current = true;
              setIsLoaded(true);
            }
            return;
          }

          const local = loadInitiativeTasks();
          if (Object.keys(local).length > 0) {
            await upsertUserAppData(
              supabase,
              userId,
              USER_DATA_KEYS.initiativeTasks,
              local
            );
          }

          if (!cancelled) {
            setTasksByInitiative(local);
            skipNextSave.current = true;
            setIsLoaded(true);
          }
          return;
        } catch (error) {
          console.error("Failed to load initiative tasks from Supabase:", error);
        }
      }

      if (!cancelled) {
        setTasksByInitiative(loadInitiativeTasks());
        skipNextSave.current = true;
        setIsLoaded(true);
      }
    }

    void loadTasks();

    return () => {
      cancelled = true;
    };
  }, [userId, isAuthLoaded]);

  const flushSave = useCallback(() => {
    const currentUserId = userIdRef.current;
    const payload = tasksRef.current;

    if (currentUserId) {
      const supabase = createClient();
      void upsertUserAppData(
        supabase,
        currentUserId,
        USER_DATA_KEYS.initiativeTasks,
        payload
      ).catch((error) => {
        console.error("Failed to save initiative tasks to Supabase:", error);
      });
      return;
    }

    saveInitiativeTasks(payload);
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
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      flushSave();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [flushSave]);

  const getTasks = useCallback(
    (initiativeSlug: string) => getInitiativeTasks(tasksByInitiative, initiativeSlug),
    [tasksByInitiative]
  );

  const ensureInitiativeTasks = useCallback((initiativeSlug: string) => {
    setTasksByInitiative((current) => {
      if (current[initiativeSlug]) {
        return current;
      }

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
        const rows = getInitiativeTasks(current, initiativeSlug);
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
      const rows = getInitiativeTasks(current, initiativeSlug);

      return {
        ...current,
        [initiativeSlug]: appendTopLevelTask(rows),
      };
    });
  }, []);

  const addSubTaskRow = useCallback((initiativeSlug: string, parentTaskNumber: string) => {
    setTasksByInitiative((current) => {
      const rows = getInitiativeTasks(current, initiativeSlug);
      if (!taskNumberExists(rows, parentTaskNumber)) {
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
      const rows = getInitiativeTasks(current, initiativeSlug);
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

    const currentUserId = userIdRef.current;
    if (currentUserId) {
      const supabase = createClient();
      void upsertUserAppData(
        supabase,
        currentUserId,
        USER_DATA_KEYS.initiativeTasks,
        next
      ).catch((error) => {
        console.error("Failed to save initiative tasks to Supabase:", error);
      });
    } else {
      saveInitiativeTasks(next);
    }

    return true;
  }, []);

  return {
    tasksByInitiative,
    isLoaded: isLoaded && isAuthLoaded,
    getTasks,
    ensureInitiativeTasks,
    updateTaskField,
    addTaskRow,
    addSubTaskRow,
    deleteTaskRow,
    removeInitiativeTasks,
  };
}
