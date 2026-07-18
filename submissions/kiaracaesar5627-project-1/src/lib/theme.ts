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
export const DEFAULT_BACKGROUND = "#f4f6fb";
export const DEFAULT_THEME: Theme = "light";
export const THEME_COOKIE = "flexiflow_theme";
export const ACCENT_COOKIE = "flexiflow_accent";
export const BACKGROUND_COOKIE = "flexiflow_background";
export const WALLPAPER_COOKIE = "flexiflow_wallpaper";
export const WALLPAPER_FIT_COOKIE = "flexiflow_wallpaper_fit";

export const WALLPAPER_PRESETS = [
  { name: "None", value: "" },
  { name: "Aurora", value: "/wallpapers/aurora.svg" },
  { name: "Topography", value: "/wallpapers/topography.svg" },
  { name: "Flow", value: "/wallpapers/flow.svg" },
] as const;

export function isTheme(value: string | undefined | null): value is Theme {
  return value === "light" || value === "dark";
}

export function normalizeAccent(value: string | undefined | null): string {
  if (value && /^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return DEFAULT_ACCENT;
}

export function normalizeBackground(value: string | undefined | null): string {
  if (value && /^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return DEFAULT_BACKGROUND;
}

export function normalizeWallpaper(value: string | undefined | null): string {
  if (!value) return "";
  if (WALLPAPER_PRESETS.some((preset) => preset.value === value)) return value;
  if (value.length > 500) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export function normalizeWallpaperFit(value: string | undefined | null): "cover" | "contain" {
  return value === "contain" ? "contain" : "cover";
}
