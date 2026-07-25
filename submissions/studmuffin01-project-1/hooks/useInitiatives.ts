"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createInitiative,
  Initiative,
  loadCustomInitiatives,
  mergeInitiatives,
  normalizeCustomInitiatives,
  saveCustomInitiatives,
  sanitizeInitiativeTitle,
} from "@/lib/initiatives";
import { createClient } from "@/lib/supabase/client";
import {
  deleteCustomInitiative,
  fetchCustomInitiatives,
  insertCustomInitiative,
  replaceCustomInitiatives,
} from "@/lib/supabase/initiativesRepository";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

export function useInitiatives() {
  const { userId, isAuthLoaded } = useSupabaseUser();
  const [customInitiatives, setCustomInitiatives] = useState<Initiative[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const customInitiativesRef = useRef<Initiative[]>([]);

  customInitiativesRef.current = customInitiatives;

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    let cancelled = false;

    async function loadInitiatives() {
      setIsLoaded(false);

      if (userId) {
        try {
          const supabase = createClient();
          const remote = normalizeCustomInitiatives(
            await fetchCustomInitiatives(supabase, userId)
          );

          if (remote.length > 0) {
            if (!cancelled) {
              setCustomInitiatives(remote);
              setIsLoaded(true);
            }
            return;
          }

          const local = normalizeCustomInitiatives(loadCustomInitiatives());
          if (local.length > 0) {
            await replaceCustomInitiatives(supabase, userId, local);
          }

          if (!cancelled) {
            setCustomInitiatives(local);
            setIsLoaded(true);
          }
          return;
        } catch (error) {
          console.error("Failed to load initiatives from Supabase:", error);
        }
      }

      const loaded = normalizeCustomInitiatives(loadCustomInitiatives());
      if (!cancelled) {
        setCustomInitiatives(loaded);
        setIsLoaded(true);
      }
    }

    void loadInitiatives();

    return () => {
      cancelled = true;
    };
  }, [userId, isAuthLoaded]);

  const initiatives = useMemo(
    () => mergeInitiatives(customInitiatives),
    [customInitiatives]
  );

  const addInitiative = useCallback(
    (title: string) => {
      const sanitizedTitle = sanitizeInitiativeTitle(title);
      if (!sanitizedTitle) {
        return null;
      }

      const current = customInitiativesRef.current;
      const newInitiative = createInitiative(sanitizedTitle);
      const next = [...current, newInitiative];
      setCustomInitiatives(next);

      if (userId) {
        const supabase = createClient();
        void insertCustomInitiative(supabase, userId, newInitiative).catch((error) => {
          console.error("Failed to save initiative to Supabase:", error);
        });
      } else {
        saveCustomInitiatives(next);
      }

      return newInitiative;
    },
    [userId]
  );

  const replaceCustomInitiativesState = useCallback(
    (nextCustomInitiatives: Initiative[]) => {
      const normalized = normalizeCustomInitiatives(nextCustomInitiatives);
      setCustomInitiatives(normalized);

      if (userId) {
        const supabase = createClient();
        void replaceCustomInitiatives(supabase, userId, normalized).catch((error) => {
          console.error("Failed to replace initiatives in Supabase:", error);
        });
      } else {
        saveCustomInitiatives(normalized);
      }
    },
    [userId]
  );

  const deleteInitiative = useCallback(
    (slug: string) => {
      const trimmedSlug = slug.trim();
      if (!trimmedSlug) {
        return false;
      }

      const current = customInitiativesRef.current;
      const next = current.filter((initiative) => initiative.slug !== trimmedSlug);
      if (next.length === current.length) {
        return false;
      }

      setCustomInitiatives(next);

      if (userId) {
        const supabase = createClient();
        void deleteCustomInitiative(supabase, userId, trimmedSlug).catch((error) => {
          console.error("Failed to delete initiative from Supabase:", error);
        });
      } else {
        saveCustomInitiatives(next);
      }

      return true;
    },
    [userId]
  );

  return {
    initiatives,
    customInitiatives,
    isLoaded: isLoaded && isAuthLoaded,
    addInitiative,
    deleteInitiative,
    replaceCustomInitiatives: replaceCustomInitiativesState,
  };
}
