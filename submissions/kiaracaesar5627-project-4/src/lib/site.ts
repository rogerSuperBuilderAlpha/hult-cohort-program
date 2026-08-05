export const SITE = {
  name: "Pattern Forge",
  tagline: "Coding interview patterns, drilled until they stick.",
  description:
    "A focused learning app for technical interview prep: two pointers, sliding windows, BFS/DFS, and hash maps — with quizzes and Ludwitt/Hult session tracking.",
  topic: "Interview prep · coding patterns",
  handle: "kiaracaesar5627",
  cohort: "Hult Cohort Summer Pilot 2026",
} as const;

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
