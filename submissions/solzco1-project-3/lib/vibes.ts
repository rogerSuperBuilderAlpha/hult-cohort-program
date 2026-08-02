import type { VibeId } from "./types";

export const VIBES: {
  id: VibeId;
  label: string;
  description: string;
}[] = [
  {
    id: "cyberpunk",
    label: "Cyberpunk Neon",
    description: "Electric indigo & emerald on obsidian",
  },
  {
    id: "sunset",
    label: "Sunset Mode",
    description: "Warm amber & rose gradients",
  },
  {
    id: "matrix",
    label: "Matrix Terminal",
    description: "Pure phosphor green on CRT black",
  },
  {
    id: "executive",
    label: "Executive Midnight",
    description: "Deep navy with gold partner CTAs",
  },
];

export function nextVibe(current: VibeId): VibeId {
  const idx = VIBES.findIndex((v) => v.id === current);
  return VIBES[(idx + 1) % VIBES.length]!.id;
}

/** Map legacy localStorage values from earlier builds */
export function normalizeVibe(saved: string | null): VibeId | null {
  if (!saved) return null;
  if (saved === "brutalist") return "sunset";
  if (saved === "y2k") return "matrix";
  if (VIBES.some((v) => v.id === saved)) return saved as VibeId;
  return null;
}
