"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  THEME_PRESETS,
  THEME_STORAGE_KEY,
  applyThemeVars,
  defaultCustomColors,
  parseStoredTheme,
  resolveColors,
  type StoredTheme,
  type ThemeColors,
  type ThemeId,
} from "@/lib/theme";

type ThemeContextValue = {
  themeId: ThemeId;
  colors: ThemeColors;
  custom: ThemeColors;
  setPreset: (id: Exclude<ThemeId, "custom">) => void;
  setCustomColor: (key: keyof ThemeColors, value: string) => void;
  setCustomColors: (colors: Partial<ThemeColors>) => void;
  useCustom: () => void;
  reset: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function persist(stored: StoredTheme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    /* ignore */
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredTheme>(() => ({
    id: "signal",
    custom: defaultCustomColors(),
  }));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const next = parseStoredTheme(localStorage.getItem(THEME_STORAGE_KEY));
    setStored(next);
    applyThemeVars(resolveColors(next));
    setReady(true);
  }, []);

  const colors = useMemo(() => resolveColors(stored), [stored]);

  useEffect(() => {
    if (!ready) return;
    applyThemeVars(colors);
    persist(stored);
  }, [colors, stored, ready]);

  const setPreset = useCallback((id: Exclude<ThemeId, "custom">) => {
    setStored((prev) => ({ ...prev, id }));
  }, []);

  const useCustom = useCallback(() => {
    setStored((prev) => ({
      id: "custom",
      custom: prev.id === "custom" ? prev.custom : { ...resolveColors(prev) },
    }));
  }, []);

  const setCustomColor = useCallback((key: keyof ThemeColors, value: string) => {
    setStored((prev) => {
      const base = prev.id === "custom" ? prev.custom : resolveColors(prev);
      return {
        id: "custom",
        custom: { ...base, [key]: value },
      };
    });
  }, []);

  const setCustomColors = useCallback((partial: Partial<ThemeColors>) => {
    setStored((prev) => {
      const base = prev.id === "custom" ? prev.custom : resolveColors(prev);
      return {
        id: "custom",
        custom: { ...base, ...partial },
      };
    });
  }, []);

  const reset = useCallback(() => {
    const fresh = {
      id: "signal" as const,
      custom: defaultCustomColors(),
    };
    setStored(fresh);
    applyThemeVars(resolveColors(fresh));
    persist(fresh);
  }, []);

  const value = useMemo(
    () => ({
      themeId: stored.id,
      colors,
      custom: stored.custom,
      setPreset,
      setCustomColor,
      setCustomColors,
      useCustom,
      reset,
    }),
    [stored, colors, setPreset, setCustomColor, setCustomColors, useCustom, reset],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function useThemePresets() {
  return THEME_PRESETS;
}
