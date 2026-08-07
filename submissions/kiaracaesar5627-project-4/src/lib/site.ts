export const SITE = {
  name: "Interview Room",
  tagline: "Practice the interview for the job you’re applying to.",
  description:
    "Mock interview questions by job application track — Software Engineer, Product Manager, Data Analyst, Marketing, and Customer Success — with scenario context, interviewer prompts, playbooks, and Ludwitt/Hult session tracking.",
  topic: "Interview prep by role",
  handle: "kiaracaesar5627",
  cohort: "Hult Cohort Summer Pilot 2026",
} as const;

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
