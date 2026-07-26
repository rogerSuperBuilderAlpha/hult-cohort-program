"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_THEME,
  THEME_COOKIE,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";

function readDomTheme(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function persistTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=${maxAge};samesite=lax`;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore quota / private mode */
  }
}

export function ThemeToggle({
  initialTheme,
  className = "",
}: {
  initialTheme?: Theme;
  className?: string;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme ?? DEFAULT_THEME);

  useEffect(() => {
    if (initialTheme) {
      persistTheme(initialTheme);
      return;
    }
    let next = readDomTheme();
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "dark" || stored === "light") next = stored;
    } catch {
      /* ignore */
    }
    setTheme(next);
    persistTheme(next);
  }, [initialTheme]);

  const dark = theme === "dark";
  const nextTheme: Theme = dark ? "light" : "dark";

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      onClick={() => {
        setTheme(nextTheme);
        persistTheme(nextTheme);
      }}
    >
      <span aria-hidden="true">{dark ? "☀" : "☾"}</span>
      <span className="theme-toggle-label">
        {dark ? "Light" : "Dark"}
      </span>
    </button>
  );
}
