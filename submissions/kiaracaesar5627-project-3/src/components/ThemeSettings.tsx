"use client";

import type { ThemeColors } from "@/lib/theme";
import { useTheme, useThemePresets } from "@/components/ThemeProvider";

const GRADIENT_FIELDS: { key: keyof ThemeColors; label: string; hint: string }[] = [
  { key: "gradA", label: "Glow A", hint: "Top-left atmosphere" },
  { key: "gradB", label: "Glow B", hint: "Top-right atmosphere" },
  { key: "gradC", label: "Base wash", hint: "Bottom / canvas tone" },
  { key: "signal", label: "Accent", hint: "Buttons, live dots, links" },
  { key: "signalDim", label: "Accent dim", hint: "Progress trails" },
  { key: "ember", label: "Secondary", hint: "Alerts / energy" },
  { key: "ink", label: "Ink", hint: "Page background" },
  { key: "paper", label: "Paper", hint: "Primary text" },
];

function previewGradient(c: ThemeColors) {
  return `radial-gradient(120% 90% at 12% 0%, ${c.gradA}55, transparent 55%), radial-gradient(90% 70% at 92% 8%, ${c.gradB}40, transparent 50%), linear-gradient(180deg, ${c.ink}, ${c.gradC})`;
}

export function ThemeSettings({ compact = false }: { compact?: boolean }) {
  const { themeId, colors, custom, setPreset, setCustomColor, useCustom, reset } =
    useTheme();
  const presets = useThemePresets();
  const editing = themeId === "custom" ? custom : colors;

  return (
    <div className={`theme-settings ${compact ? "is-compact" : ""}`}>
      <div className="theme-preset-grid">
        {presets.map((preset) => {
          const active = themeId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              className={`theme-preset ${active ? "is-active" : ""}`}
              onClick={() => setPreset(preset.id)}
              aria-pressed={active}
            >
              <span
                className="theme-preset-swatch"
                style={{ background: previewGradient(preset.colors) }}
                aria-hidden
              />
              <span className="theme-preset-meta">
                <span className="font-display text-lg leading-tight">{preset.name}</span>
                <span className="text-xs text-[var(--fog)]">{preset.blurb}</span>
              </span>
            </button>
          );
        })}
        <button
          type="button"
          className={`theme-preset ${themeId === "custom" ? "is-active" : ""}`}
          onClick={useCustom}
          aria-pressed={themeId === "custom"}
        >
          <span
            className="theme-preset-swatch"
            style={{ background: previewGradient(editing) }}
            aria-hidden
          />
          <span className="theme-preset-meta">
            <span className="font-display text-lg leading-tight">Custom</span>
            <span className="text-xs text-[var(--fog)]">
              Dial your own gradient stops.
            </span>
          </span>
        </button>
      </div>

      <div className="theme-live-preview" style={{ background: previewGradient(editing) }}>
        <p className="font-mono text-[0.65rem] uppercase tracking-wider text-[var(--paper)]/80">
          Live gradient
        </p>
        <p className="mt-2 font-display text-2xl tracking-tight text-[var(--paper)]">
          {themeId === "custom" ? "Custom mix" : presets.find((p) => p.id === themeId)?.name}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="btn btn-primary text-sm pointer-events-none">Accent</span>
          <span className="btn btn-ghost text-sm pointer-events-none">Ghost</span>
        </div>
      </div>

      <div className="theme-color-grid">
        {GRADIENT_FIELDS.map((field) => (
          <label key={field.key} className="theme-color-field">
            <span className="flex items-center justify-between gap-2">
              <span>
                <span className="block text-sm font-medium">{field.label}</span>
                <span className="block text-[0.7rem] text-[var(--fog)]">{field.hint}</span>
              </span>
              <span className="font-mono text-xs text-[var(--fog)]">{editing[field.key]}</span>
            </span>
            <input
              type="color"
              value={editing[field.key]}
              onChange={(e) => setCustomColor(field.key, e.target.value)}
              className="theme-color-input"
              aria-label={field.label}
            />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-ghost text-sm" onClick={reset}>
          Reset to Trailmark
        </button>
        {themeId !== "custom" ? (
          <button type="button" className="btn btn-primary text-sm" onClick={useCustom}>
            Customize this look
          </button>
        ) : (
          <p className="self-center font-mono text-xs text-[var(--signal)]">
            Custom theme saved in this browser
          </p>
        )}
      </div>
    </div>
  );
}
