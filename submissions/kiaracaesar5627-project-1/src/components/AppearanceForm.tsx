"use client";

import { useState } from "react";
import { updateThemeAction, uploadWallpaperAction } from "@/lib/actions";
import { ACCENT_PRESETS, WALLPAPER_PRESETS } from "@/lib/theme";
import type { Theme } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";

export function AppearanceForm({
  initialTheme,
  initialAccent,
  initialBackground,
  initialWallpaper,
  initialWallpaperFit,
}: {
  initialTheme: Theme;
  initialAccent: string;
  initialBackground: string;
  initialWallpaper: string;
  initialWallpaperFit: "cover" | "contain";
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [accent, setAccent] = useState(initialAccent);
  const [background, setBackground] = useState(initialBackground);
  const [wallpaper, setWallpaper] = useState(initialWallpaper);
  const [wallpaperFit, setWallpaperFit] = useState(initialWallpaperFit);

  return (
    <>
    <form className="form" action={updateThemeAction}>
      <input type="hidden" name="redirectTo" value="/account" />
      <input type="hidden" name="theme" value={theme} />
      <input type="hidden" name="accent" value={accent} />
      <input type="hidden" name="background" value={background} />
      <input type="hidden" name="wallpaper" value={wallpaper} />
      <input type="hidden" name="wallpaperFit" value={wallpaperFit} />

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

      <div>
        <div style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Background</div>
        <div
          className="wallpaper-preview"
          style={{
            backgroundColor: background,
            backgroundImage: wallpaper ? `url(${JSON.stringify(wallpaper)})` : "none",
            backgroundSize: wallpaperFit,
          }}
          aria-label="Background preview"
        />
        <label style={{ marginTop: "0.6rem" }}>
          Background color
          <input
            type="color"
            value={background}
            onChange={(event) => setBackground(event.target.value)}
          />
        </label>
      </div>

      <div>
        <div style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Wallpaper</div>
        <div className="wallpaper-grid">
          {WALLPAPER_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              className={`wallpaper-option${wallpaper === preset.value ? " selected" : ""}`}
              onClick={() => setWallpaper(preset.value)}
              style={{
                backgroundColor: background,
                backgroundImage: preset.value
                  ? `url(${JSON.stringify(preset.value)})`
                  : "none",
              }}
            >
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
        <label style={{ marginTop: "0.6rem" }}>
          Custom wallpaper URL
          <input
            type="url"
            value={
              WALLPAPER_PRESETS.some((preset) => preset.value === wallpaper)
                ? ""
                : wallpaper
            }
            placeholder="https://example.com/wallpaper.jpg"
            onChange={(event) => setWallpaper(event.target.value)}
          />
        </label>
        <label style={{ marginTop: "0.6rem" }}>
          Image sizing
          <select
            value={wallpaperFit}
            onChange={(event) =>
              setWallpaperFit(event.target.value === "contain" ? "contain" : "cover")
            }
          >
            <option value="cover">Fill screen</option>
            <option value="contain">Fit full image</option>
          </select>
        </label>
        <p className="muted" style={{ marginBottom: 0 }}>
          Custom wallpapers must use a secure HTTPS image URL.
        </p>
      </div>

      <SubmitButton>Save appearance</SubmitButton>
    </form>

    <form className="form" action={uploadWallpaperAction} style={{ marginTop: "1.1rem" }}>
      <div>
        <div style={{ fontWeight: 600, marginBottom: "0.4rem" }}>
          Upload your own background
        </div>
        <label>
          Image file
          <input type="file" name="file" accept="image/*" required />
        </label>
        <p className="muted" style={{ marginBottom: 0 }}>
          PNG, JPG, WebP or GIF up to 5 MB. Uploading sets it as your wallpaper
          right away.
        </p>
      </div>
      <SubmitButton>Upload &amp; use image</SubmitButton>
    </form>
    </>
  );
}
