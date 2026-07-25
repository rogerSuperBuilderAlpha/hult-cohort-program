"use client";



import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { storedInitiativeDeadline } from "@/lib/initiativeDeadlines";

import {

  createInitiative,

  filterActiveInitiatives,

  filterArchivedInitiatives,

  Initiative,

  loadCustomInitiatives,

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



async function patchInitiativeOnApi(

  slug: string,

  updates: { title?: string; archived?: boolean }

): Promise<void> {

  const response = await fetch("/api/dashboard/initiatives", {

    method: "PATCH",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({ slug, ...updates }),

  });



  if (!response.ok) {

    throw new Error("Failed to update initiative on server.");

  }

}



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

              saveCustomInitiatives(remote);

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



  const activeCustomInitiatives = useMemo(

    () => filterActiveInitiatives(customInitiatives),

    [customInitiatives]

  );



  const archivedCustomInitiatives = useMemo(

    () => filterArchivedInitiatives(customInitiatives),

    [customInitiatives]

  );



  const initiatives = activeCustomInitiatives;



  const persistInitiatives = useCallback(

    (next: Initiative[]) => {

      const normalized = normalizeCustomInitiatives(next);

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

        void insertCustomInitiative(supabase, userId, {

          ...newInitiative,

          deadline: storedInitiativeDeadline(newInitiative.deadline),

        }).catch((error) => {

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

      persistInitiatives(nextCustomInitiatives);

    },

    [persistInitiatives]

  );



  const updateInitiativeTitle = useCallback(

    (slug: string, title: string) => {

      const trimmedSlug = slug.trim();

      const sanitizedTitle = sanitizeInitiativeTitle(title);

      if (!trimmedSlug || !sanitizedTitle) {

        return false;

      }



      const current = customInitiativesRef.current;

      const index = current.findIndex((initiative) => initiative.slug === trimmedSlug);

      if (index === -1) {

        return false;

      }



      const next = current.map((initiative) =>

        initiative.slug === trimmedSlug ? { ...initiative, title: sanitizedTitle } : initiative

      );

      setCustomInitiatives(next);



      if (userId) {

        void patchInitiativeOnApi(trimmedSlug, { title: sanitizedTitle }).catch((error) => {

          console.error("Failed to update initiative title in Supabase:", error);

        });

      } else {

        saveCustomInitiatives(next);

      }



      return true;

    },

    [userId]

  );



  const setInitiativeArchived = useCallback(

    (slug: string, archived: boolean) => {

      const trimmedSlug = slug.trim();

      if (!trimmedSlug) {

        return false;

      }



      const current = customInitiativesRef.current;

      const index = current.findIndex((initiative) => initiative.slug === trimmedSlug);

      if (index === -1) {

        return false;

      }



      const next = current.map((initiative) =>

        initiative.slug === trimmedSlug

          ? { ...initiative, archived: archived || undefined }

          : initiative

      );

      setCustomInitiatives(next);



      if (userId) {

        void patchInitiativeOnApi(trimmedSlug, { archived }).catch((error) => {

          console.error("Failed to archive initiative in Supabase:", error);

        });

      } else {

        saveCustomInitiatives(next);

      }



      return true;

    },

    [userId]

  );



  const archiveInitiative = useCallback(

    (slug: string) => setInitiativeArchived(slug, true),

    [setInitiativeArchived]

  );



  const unarchiveInitiative = useCallback(

    (slug: string) => setInitiativeArchived(slug, false),

    [setInitiativeArchived]

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

    activeCustomInitiatives,

    archivedCustomInitiatives,

    isLoaded: isLoaded && isAuthLoaded,

    addInitiative,

    updateInitiativeTitle,

    archiveInitiative,

    unarchiveInitiative,

    deleteInitiative,

    replaceCustomInitiatives: replaceCustomInitiativesState,

  };

}


