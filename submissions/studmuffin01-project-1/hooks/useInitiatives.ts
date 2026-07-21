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

export function useInitiatives() {
  const [customInitiatives, setCustomInitiatives] = useState<Initiative[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const customInitiativesRef = useRef<Initiative[]>([]);

  customInitiativesRef.current = customInitiatives;

  useEffect(() => {
    const loaded = normalizeCustomInitiatives(loadCustomInitiatives());
    setCustomInitiatives(loaded);
    setIsLoaded(true);
  }, []);

  const initiatives = useMemo(
    () => mergeInitiatives(customInitiatives),
    [customInitiatives]
  );

  const addInitiative = useCallback((title: string) => {
    const sanitizedTitle = sanitizeInitiativeTitle(title);
    if (!sanitizedTitle) {
      return null;
    }

    const current = customInitiativesRef.current;
    const newInitiative = createInitiative(sanitizedTitle);
    const next = [...current, newInitiative];
    saveCustomInitiatives(next);
    setCustomInitiatives(next);

    return newInitiative;
  }, []);

  const replaceCustomInitiatives = useCallback((nextCustomInitiatives: Initiative[]) => {
    const normalized = normalizeCustomInitiatives(nextCustomInitiatives);
    setCustomInitiatives(normalized);
    saveCustomInitiatives(normalized);
  }, []);

  const deleteInitiative = useCallback((slug: string) => {
    const trimmedSlug = slug.trim();
    if (!trimmedSlug) {
      return false;
    }

    const current = customInitiativesRef.current;
    const next = current.filter((initiative) => initiative.slug !== trimmedSlug);
    if (next.length === current.length) {
      return false;
    }

    saveCustomInitiatives(next);
    setCustomInitiatives(next);
    return true;
  }, []);

  return {
    initiatives,
    customInitiatives,
    isLoaded,
    addInitiative,
    deleteInitiative,
    replaceCustomInitiatives,
  };
}
