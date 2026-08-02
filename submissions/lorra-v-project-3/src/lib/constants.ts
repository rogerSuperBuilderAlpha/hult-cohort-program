export const COHORT_SLUG = "hult-summer-2026";

export const SECTORS = [
  "Education",
  "Community Development",
  "Healthcare",
  "Finance",
  "Creative Industries",
  "Climate",
  "Tourism",
  "Public Services",
  "Productivity",
  "Workforce Development",
  "AI",
  "Software Development",
] as const;

export const NEEDS = [
  "Pilot organization",
  "Technical collaborator",
  "Industry mentor",
  "Early users",
  "Data partner",
  "Sponsor",
  "Investor",
  "Media coverage",
  "Research partner",
  "Distribution partner",
] as const;

export const PROJECT_STAGES = [
  { value: "idea", label: "Idea" },
  { value: "building", label: "Building" },
  { value: "launched", label: "Launched" },
  { value: "pilot", label: "Pilot" },
  { value: "scaling", label: "Scaling" },
] as const;

export const SOCIAL_LINK_FIELDS = [
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/…" },
  { key: "x", label: "X / Twitter", placeholder: "https://x.com/…" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/…" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/…" },
] as const;

export type Sector = (typeof SECTORS)[number];
export type Need = (typeof NEEDS)[number];
export type ProjectStage = (typeof PROJECT_STAGES)[number]["value"];
