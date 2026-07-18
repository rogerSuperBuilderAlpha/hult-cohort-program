"use client";

import { useState } from "react";
import { updateThemeAction } from "@/lib/actions";
import { ACCENT_PRESETS } from "@/lib/theme";
import type { Theme } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";

export function AppearanceForm({
  initialTheme,
  initialAccent,
}: {
  initialTheme: Theme;
  initialAccent: string;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [accent, setAccent] = useState(initialAccent);

  return (
    <form className="form" action={updateThemeAction}>
      <input type="hidden" name="redirectTo" value="/account" />
      <input type="hidden" name="theme" value={theme} />
      <input type="hidden" name="accent" value={accent} />

      <div>
        <div style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Theme</div>
        <div className="tabs">
          <button
            type="button"
            className={theme === "light" ? "active" : ""}
            onClick={() => setTheme("light")}
            style={{ border: 0, background: "transparent", cursor: "pointer" }}
          >
            ☀ Light
          </button>
          <button
            type="button"
            className={theme === "dark" ? "active" : ""}
            onClick={() => setTheme("dark")}
            style={{ border: 0, background: "transparent", cursor: "pointer" }}
          >
            ☾ Dark
          </button>
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Accent color</div>
        <div className="swatch-row">
          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              title={p.name}
              onClick={() => setAccent(p.value)}
              className={`swatch${accent.toLowerCase() === p.value.toLowerCase() ? " selected" : ""}`}
              style={{ background: p.value }}
              aria-label={p.name}
            />
          ))}
        </div>
        <label style={{ marginTop: "0.6rem" }}>
          Custom
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
          />
        </label>
      </div>

      <SubmitButton>Save appearance</SubmitButton>
    </form>
  );
}
