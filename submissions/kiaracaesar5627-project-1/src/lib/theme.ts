import type { Theme } from "./types";

// Client-safe theme constants.
export const ACCENT_PRESETS: { name: string; value: string }[] = [
  { name: "Blue", value: "#2563eb" },
  { name: "Teal", value: "#0d9488" },
  { name: "Emerald", value: "#059669" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Amber", value: "#d97706" },
  { name: "Rose", value: "#e11d48" },
  { name: "Slate", value: "#475569" },
  { name: "Violet", value: "#7c3aed" },
];

export const DEFAULT_ACCENT = "#2563eb";
export const DEFAULT_THEME: Theme = "light";
export const THEME_COOKIE = "flexiflow_theme";
export const ACCENT_COOKIE = "flexiflow_accent";

export function isTheme(value: string | undefined | null): value is Theme {
  return value === "light" || value === "dark";
}

export function normalizeAccent(value: string | undefined | null): string {
  if (value && /^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return DEFAULT_ACCENT;
}
