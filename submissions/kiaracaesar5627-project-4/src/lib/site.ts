export const SITE = {
  name: "Interview Room",
  tagline: "Practice the interview. Not the textbook.",
  description:
    "A mock-interview app for job seekers: timed rounds for behavioral STAR answers, coding screens, system design, and closing questions — with Ludwitt/Hult session tracking so practice sessions count.",
  topic: "Interview prep",
  handle: "kiaracaesar5627",
  cohort: "Hult Cohort Summer Pilot 2026",
} as const;

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
