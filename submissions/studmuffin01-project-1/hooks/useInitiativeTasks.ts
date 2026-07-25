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
  saveInitiativeTasks,
  sanitizeTaskField,
  TaskField,
  taskNumberExists,
} from "@/lib/initiativeTasks";

const SAVE_DEBOUNCE_MS = 400;

export function useInitiativeTasks() {
  const [tasksByInitiative, setTasksByInitiative] = useState<AllInitiativeTasks>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const skipNextSave = useRef(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tasksRef = useRef(tasksByInitiative);

  tasksRef.current = tasksByInitiative;

  useEffect(() => {
    setTasksByInitiative(loadInitiativeTasks());
    setIsLoaded(true);
  }, []);

  const flushSave = useCallback(() => {
    saveInitiativeTasks(tasksRef.current);
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
    saveInitiativeTasks(next);
    setTasksByInitiative(next);
    return true;
  }, []);

  return {
    tasksByInitiative,
    isLoaded,
    getTasks,
    ensureInitiativeTasks,
    updateTaskField,
    addTaskRow,
    addSubTaskRow,
    deleteTaskRow,
    removeInitiativeTasks,
  };
}
