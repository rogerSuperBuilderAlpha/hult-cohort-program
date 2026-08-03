export const SITE = {
  name: "Trailmark",
  tagline: "Don't trust our word — inspect their GitHub.",
  support:
    "The public marketing surface for the Hult Cohort Summer Pilot — builders shortlisted by commits, reviews, and live deploys.",
  cohort: "Hult Cohort Developer Program",
  term: "Summer Pilot 2026",
  campus: "Hult Boston · hybrid",
  description:
    "Trailmark is the vibe marketing platform for the Hult Cohort Developer Program Summer Pilot 2026. Browse builder profiles, peer-reviewed project evidence, and production deploys — then request intros or RSVP for the Aug 19 hiring showcase.",
  pitch:
    "We produce developers you can evaluate entirely on GitHub — every review, every deployment, every merged PR is public — and you pay only when you hire.",
} as const;

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function pmUrl() {
  return (
    process.env.NEXT_PUBLIC_PM_URL?.replace(/\/$/, "") ||
    "https://pilot-hult-pm.vercel.app"
  );
}

export function commsUrl() {
  return (
    process.env.NEXT_PUBLIC_COMMS_URL?.replace(/\/$/, "") ||
    "https://pilot-hult-comms.vercel.app"
  );
}
