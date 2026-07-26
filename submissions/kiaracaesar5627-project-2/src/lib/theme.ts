export type Theme = "light" | "dark";

export const THEME_COOKIE = "huddle_theme";
export const THEME_STORAGE_KEY = "huddle_theme";
export const DEFAULT_THEME: Theme = "light";

export function isTheme(value: string | undefined | null): value is Theme {
  return value === "light" || value === "dark";
}

export function parseTheme(value: string | undefined | null): Theme {
  return value === "dark" ? "dark" : "light";
}
