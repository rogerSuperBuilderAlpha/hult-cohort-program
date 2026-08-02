export const COHORT = {
  name: "Hult Developer Cohort",
  term: "Summer Pilot 2026",
  org: "rogerSuperBuilderAlpha",
  repo: "hult-cohort-program",
} as const;

export const URLS = {
  winningPm: process.env.NEXT_PUBLIC_WINNING_PM_URL ?? "https://forth-bice.vercel.app/",
  winningComms:
    process.env.NEXT_PUBLIC_WINNING_COMMS_URL ??
    "https://cohort-comms-phi.vercel.app/",
  solPm: process.env.NEXT_PUBLIC_SOL_PM_URL ?? "https://solzpm.vercel.app/",
  solComms:
    process.env.NEXT_PUBLIC_SOL_COMMS_URL ?? "https://solforth.vercel.app/",
  site: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pulse-ten-theta.vercel.app",
  calendly:
    process.env.NEXT_PUBLIC_CALENDLY_URL ??
    "https://calendly.com/hult-cohort/15min",
} as const;

export const PLACEMENT_EMAIL =
  process.env.PLACEMENT_LEAD_EMAIL ?? "solangecoker@hotmail.com";

export function profileUrl(handle: string): string {
  return `${URLS.site.replace(/\/$/, "")}/builders/${handle}`;
}

export function githubUrl(handle: string): string {
  return `https://github.com/${handle}`;
}

export function githubAvatar(handle: string): string {
  return `https://avatars.githubusercontent.com/${handle}?s=256`;
}
