"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AllSubmissions,
  getRowSubmission,
  loadCohortSubmissions,
  parseCohortSubmissions,
  sanitizeCohortName,
  saveCohortSubmissions,
  SubmissionField,
} from "@/lib/cohortSubmissions";
import { createClient } from "@/lib/supabase/client";
import {
  fetchUserAppData,
  upsertUserAppData,
  USER_DATA_KEYS,
} from "@/lib/supabase/userDataRepository";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

const SAVE_DEBOUNCE_MS = 400;

export function useCohortSubmissions() {
  const { userId, isAuthLoaded } = useSupabaseUser();
  const [submissions, setSubmissions] = useState<AllSubmissions>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const skipNextSave = useRef(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submissionsRef = useRef(submissions);
  const userIdRef = useRef(userId);

  submissionsRef.current = submissions;
  userIdRef.current = userId;

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    let cancelled = false;

    async function loadSubmissions() {
      setIsLoaded(false);

      if (userId) {
        try {
          const supabase = createClient();
          const remote = await fetchUserAppData(
            supabase,
            userId,
            USER_DATA_KEYS.cohortSubmissions,
            parseCohortSubmissions
          );

          if (remote && Object.keys(remote).length > 0) {
            if (!cancelled) {
              setSubmissions(remote);
              skipNextSave.current = true;
              setIsLoaded(true);
            }
            return;
          }

          const local = loadCohortSubmissions();
          if (Object.keys(local).length > 0) {
            await upsertUserAppData(
              supabase,
              userId,
              USER_DATA_KEYS.cohortSubmissions,
              local
            );
          }

          if (!cancelled) {
            setSubmissions(local);
            skipNextSave.current = true;
            setIsLoaded(true);
          }
          return;
        } catch (error) {
          console.error("Failed to load cohort submissions from Supabase:", error);
        }
      }

      if (!cancelled) {
        setSubmissions(loadCohortSubmissions());
        skipNextSave.current = true;
        setIsLoaded(true);
      }
    }

    void loadSubmissions();

    return () => {
      cancelled = true;
    };
  }, [userId, isAuthLoaded]);

  const flushSave = useCallback(() => {
    const currentUserId = userIdRef.current;
    const payload = submissionsRef.current;

    if (currentUserId) {
      const supabase = createClient();
      void upsertUserAppData(
        supabase,
        currentUserId,
        USER_DATA_KEYS.cohortSubmissions,
        payload
      ).catch((error) => {
        console.error("Failed to save cohort submissions to Supabase:", error);
      });
      return;
    }

    saveCohortSubmissions(payload);
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
    isLoaded: isLoaded && isAuthLoaded,
    toggleSubmission,
    updateRowName,
  };
}
