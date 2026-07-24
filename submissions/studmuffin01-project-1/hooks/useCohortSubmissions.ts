"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AllSubmissions,
  getRowSubmission,
  loadCohortSubmissions,
  sanitizeCohortName,
  saveCohortSubmissions,
  SubmissionField,
} from "@/lib/cohortSubmissions";

const SAVE_DEBOUNCE_MS = 400;

export function useCohortSubmissions() {
  const [submissions, setSubmissions] = useState<AllSubmissions>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const skipNextSave = useRef(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submissionsRef = useRef(submissions);

  submissionsRef.current = submissions;

  useEffect(() => {
    setSubmissions(loadCohortSubmissions());
    setIsLoaded(true);
  }, []);

  const flushSave = useCallback(() => {
    saveCohortSubmissions(submissionsRef.current);
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
  }, [submissions, isLoaded, flushSave]);

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

  const toggleSubmission = useCallback(
    (initiativeSlug: string, rowNumber: number, field: SubmissionField) => {
      setSubmissions((current) => {
        const initiativeRows = current[initiativeSlug] ?? {};
        const row = getRowSubmission(initiativeRows, rowNumber);

        return {
          ...current,
          [initiativeSlug]: {
            ...initiativeRows,
            [rowNumber]: {
              ...row,
              [field]: !row[field],
            },
          },
        };
      });
    },
    []
  );

  const updateRowName = useCallback(
    (initiativeSlug: string, rowNumber: number, name: string) => {
      setSubmissions((current) => {
        const initiativeRows = current[initiativeSlug] ?? {};
        const row = getRowSubmission(initiativeRows, rowNumber);
        const sanitizedName = sanitizeCohortName(name);

        if (row.name === sanitizedName) {
          return current;
        }

        return {
          ...current,
          [initiativeSlug]: {
            ...initiativeRows,
            [rowNumber]: {
              ...row,
              name: sanitizedName,
            },
          },
        };
      });
    },
    []
  );

  return {
    submissions,
    isLoaded,
    toggleSubmission,
    updateRowName,
  };
}
