export type Privacy = "public" | "private";

export type ProjectLink = {
  label: string;
  href: string;
  kind: "repo" | "deploy" | "external";
};

export type SocialLinks = {
  /** Omitted on sample profiles so we never invent stranger social URLs. */
  github?: string;
  linkedin?: string;
  x?: string;
  portfolio?: string;
  deployment?: string;
};

export type BuildLogEntry = {
  week: string;
  title: string;
};

export type ShowcaseMedia = {
  kind: "screenshot" | "video" | "architecture" | "prototype";
  label: string;
  description?: string;
  href?: string;
};

export type ProofItem = {
  label: string;
  detail: string;
  href?: string;
};

export type DeployStatus = "live" | "beta";

export type FeaturedProject = {
  title: string;
  tagline: string;
  problem: string;
  solutionItems: ShowcaseMedia[];
  proofOfWork: ProofItem[];
  liveAppUrl?: string;
  repoUrl?: string;
  docsUrl?: string;
  status: DeployStatus;
};

export type ActivityItem = {
  id: string;
  text: string;
  /** ISO timestamp or human label like "Yesterday" */
  when: string;
};

export type Person = {
  handle: string;
  name: string;
  campus: string;
  role: string;
  /** Short directory blurb */
  headline: string;
  whyImHere: string;
  skills: string[];
  privacy: Privacy;
  photoInitials: string;
  /** Optional photo URL; initials used when absent */
  photoUrl?: string;
  links: SocialLinks;
  buildLog: BuildLogEntry[];
  featuredProject: FeaturedProject;
  activity: ActivityItem[];
  /** Used by Live Summary / portfolio counts */
  projects: ProjectLink[];
  /**
   * Seed / fictional directory filler. Real cohort members omit this or set false.
   * Demo profiles are badged in the UI and blocked from partner intros.
   */
  isDemo?: boolean;
};

export type PmInitiative = {
  id: string;
  title: string;
  status: "on-track" | "at-risk" | "done";
  ownerHandle: string;
  openTasks: number;
  doneTasks: number;
  updatedAt: string;
};

export type PmSnapshot = {
  sourceLabel: string;
  sourceUrl: string;
  syncedAt: string;
  initiatives: PmInitiative[];
};

export type PartnerInterest =
  | "sponsor"
  | "pilot"
  | "recruit"
  | "mentor";

export const PARTNER_INTEREST_OPTIONS: {
  value: PartnerInterest;
  label: string;
  description: string;
}[] = [
  {
    value: "sponsor",
    label: "Sponsor",
    description: "Support projects",
  },
  {
    value: "pilot",
    label: "Pilot Partner",
    description: "Test solutions internally",
  },
  {
    value: "recruit",
    label: "Recruit",
    description: "Access emerging talent",
  },
  {
    value: "mentor",
    label: "Mentor",
    description: "Share expertise",
  },
];

export type IntroRequest = {
  partnerName: string;
  company: string;
  email: string;
  interest: PartnerInterest;
  studentHandles: string[];
  message: string;
};

export type RsvpRequest = {
  name: string;
  email: string;
  company?: string;
  attending: "yes" | "maybe";
};
