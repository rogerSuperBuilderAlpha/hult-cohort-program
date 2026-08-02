import type { VibeId } from "./types";

export const VIBES: {
  id: VibeId;
  label: string;
  description: string;
}[] = [
  {
    id: "cyberpunk",
    label: "Cyberpunk Neon",
    description: "Obsidian base, electric indigo & emerald accents",
  },
  {
    id: "brutalist",
    label: "Minimalist Brutalist",
    description: "High-contrast monochrome with sharp edges",
  },
  {
    id: "y2k",
    label: "Y2K Retro Terminal",
    description: "Phosphor green on CRT black",
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
