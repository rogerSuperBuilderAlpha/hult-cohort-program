export type ThemeId =
  | "signal"
  | "tide"
  | "ember"
  | "noir"
  | "frost"
  | "custom";

export type ThemeColors = {
  ink: string;
  ink2: string;
  ink3: string;
  paper: string;
  fog: string;
  signal: string;
  signalDim: string;
  ember: string;
  /** Atmosphere gradient stops (A = top-left glow, B = top-right, C = base wash) */
  gradA: string;
  gradB: string;
  gradC: string;
};

export type ThemePreset = {
  id: Exclude<ThemeId, "custom">;
  name: string;
  blurb: string;
  colors: ThemeColors;
};

export const THEME_STORAGE_KEY = "signal-theme-v1";

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "signal",
    name: "Trailmark",
    blurb: "Lime pulse on graphite — the default.",
    colors: {
      ink: "#0b0f14",
      ink2: "#121821",
      ink3: "#1a2330",
      paper: "#eef2f6",
      fog: "#c8d0db",
      signal: "#b8f24a",
      signalDim: "#7aa82e",
      ember: "#ff6b4a",
      gradA: "#b8f24a",
      gradB: "#ff6b4a",
      gradC: "#0a1018",
    },
  },
  {
    id: "tide",
    name: "Tide",
    blurb: "Seafoam + coral over deep navy.",
    colors: {
      ink: "#061018",
      ink2: "#0b1a24",
      ink3: "#123041",
      paper: "#e8f4f7",
      fog: "#a9c5d0",
      signal: "#3ddec9",
      signalDim: "#1f9f90",
      ember: "#ff7a59",
      gradA: "#3ddec9",
      gradB: "#ff7a59",
      gradC: "#071520",
    },
  },
  {
    id: "ember",
    name: "Forge",
    blurb: "Amber heat on charcoal steel.",
    colors: {
      ink: "#100c0a",
      ink2: "#1a1410",
      ink3: "#2a2018",
      paper: "#f6efe6",
      fog: "#d2c4b4",
      signal: "#ffb020",
      signalDim: "#c47d0a",
      ember: "#ff5a3c",
      gradA: "#ffb020",
      gradB: "#ff5a3c",
      gradC: "#140e0a",
    },
  },
  {
    id: "noir",
    name: "Noir",
    blurb: "Champagne gold on near-black.",
    colors: {
      ink: "#080808",
      ink2: "#121212",
      ink3: "#1e1e1e",
      paper: "#f3f0ea",
      fog: "#c4bfb6",
      signal: "#e4c56a",
      signalDim: "#b08f3a",
      ember: "#d96b4c",
      gradA: "#e4c56a",
      gradB: "#d96b4c",
      gradC: "#0c0c0c",
    },
  },
  {
    id: "frost",
    name: "Frost",
    blurb: "Ice blue accents on cold slate.",
    colors: {
      ink: "#0a0e14",
      ink2: "#121820",
      ink3: "#1c2633",
      paper: "#eef3f8",
      fog: "#b7c4d4",
      signal: "#7eb6ff",
      signalDim: "#3d7ec7",
      ember: "#89f0d0",
      gradA: "#7eb6ff",
      gradB: "#89f0d0",
      gradC: "#0a1018",
    },
  },
];

export const DEFAULT_THEME_ID: ThemeId = "signal";

export type StoredTheme = {
  id: ThemeId;
  custom: ThemeColors;
};

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  const n = Number.parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function normalizeHex(value: string | undefined | null, fallback: string): string {
  if (value && /^#[0-9a-fA-F]{6}$/.test(value.trim())) return value.trim().toLowerCase();
  return fallback;
}

export function defaultCustomColors(): ThemeColors {
  return { ...THEME_PRESETS[0].colors };
}

export function resolveColors(stored: StoredTheme): ThemeColors {
  if (stored.id === "custom") return stored.custom;
  const preset = THEME_PRESETS.find((p) => p.id === stored.id);
  return preset ? preset.colors : THEME_PRESETS[0].colors;
}

export function colorsToCssVars(colors: ThemeColors): Record<string, string> {
  const a = hexToRgb(colors.gradA);
  const b = hexToRgb(colors.gradB);
  const signal = hexToRgb(colors.signal);
  const paper = hexToRgb(colors.paper);

  return {
    "--ink": colors.ink,
    "--ink-2": colors.ink2,
    "--ink-3": colors.ink3,
    "--paper": colors.paper,
    "--fog": colors.fog,
    "--signal": colors.signal,
    "--signal-dim": colors.signalDim,
    "--ember": colors.ember,
    "--grad-a": colors.gradA,
    "--grad-b": colors.gradB,
    "--grad-c": colors.gradC,
    "--grad-a-rgb": a ? `${a.r}, ${a.g}, ${a.b}` : "184, 242, 74",
    "--grad-b-rgb": b ? `${b.r}, ${b.g}, ${b.b}` : "255, 107, 74",
    "--signal-rgb": signal ? `${signal.r}, ${signal.g}, ${signal.b}` : "184, 242, 74",
    "--paper-rgb": paper ? `${paper.r}, ${paper.g}, ${paper.b}` : "238, 242, 246",
    "--line": paper
      ? `rgba(${paper.r}, ${paper.g}, ${paper.b}, 0.12)`
      : "rgba(238, 242, 246, 0.12)",
    "--glow": signal
      ? `rgba(${signal.r}, ${signal.g}, ${signal.b}, 0.18)`
      : "rgba(184, 242, 74, 0.18)",
  };
}

export function applyThemeVars(colors: ThemeColors, root: HTMLElement = document.documentElement) {
  const vars = colorsToCssVars(colors);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

export function parseStoredTheme(raw: string | null): StoredTheme {
  const fallback: StoredTheme = {
    id: DEFAULT_THEME_ID,
    custom: defaultCustomColors(),
  };
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredTheme>;
    const id = (["signal", "tide", "ember", "noir", "frost", "custom"] as ThemeId[]).includes(
      parsed.id as ThemeId,
    )
      ? (parsed.id as ThemeId)
      : DEFAULT_THEME_ID;
    const base = defaultCustomColors();
    const custom = {
      ink: normalizeHex(parsed.custom?.ink, base.ink),
      ink2: normalizeHex(parsed.custom?.ink2, base.ink2),
      ink3: normalizeHex(parsed.custom?.ink3, base.ink3),
      paper: normalizeHex(parsed.custom?.paper, base.paper),
      fog: normalizeHex(parsed.custom?.fog, base.fog),
      signal: normalizeHex(parsed.custom?.signal, base.signal),
      signalDim: normalizeHex(parsed.custom?.signalDim, base.signalDim),
      ember: normalizeHex(parsed.custom?.ember, base.ember),
      gradA: normalizeHex(parsed.custom?.gradA, base.gradA),
      gradB: normalizeHex(parsed.custom?.gradB, base.gradB),
      gradC: normalizeHex(parsed.custom?.gradC, base.gradC),
    };
    return { id, custom };
  } catch {
    return fallback;
  }
}

/** Inline boot script — prevents flash before React hydrates. */
export const THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var raw=localStorage.getItem(k);if(!raw)return;var t=JSON.parse(raw);var presets=${JSON.stringify(
  Object.fromEntries(THEME_PRESETS.map((p) => [p.id, p.colors])),
)};var c=t.id==="custom"&&t.custom?t.custom:presets[t.id]||presets.signal;var r=document.documentElement;function hexRgb(h){var m=/^#([0-9a-fA-F]{6})$/.exec(h||"");if(!m)return null;var n=parseInt(m[1],16);return[(n>>16)&255,(n>>8)&255,n&255];}var pairs=[["--ink",c.ink],["--ink-2",c.ink2],["--ink-3",c.ink3],["--paper",c.paper],["--fog",c.fog],["--signal",c.signal],["--signal-dim",c.signalDim],["--ember",c.ember],["--grad-a",c.gradA],["--grad-b",c.gradB],["--grad-c",c.gradC]];for(var i=0;i<pairs.length;i++){if(pairs[i][1])r.style.setProperty(pairs[i][0],pairs[i][1]);}var a=hexRgb(c.gradA),b=hexRgb(c.gradB),s=hexRgb(c.signal),p=hexRgb(c.paper);if(a)r.style.setProperty("--grad-a-rgb",a.join(", "));if(b)r.style.setProperty("--grad-b-rgb",b.join(", "));if(s){r.style.setProperty("--signal-rgb",s.join(", "));r.style.setProperty("--glow","rgba("+s.join(", ")+", 0.18)");}if(p){r.style.setProperty("--paper-rgb",p.join(", "));r.style.setProperty("--line","rgba("+p.join(", ")+", 0.12)");}}catch(e){}})();`;
