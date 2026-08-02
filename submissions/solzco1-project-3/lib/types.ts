export type VibeId = "cyberpunk" | "sunset" | "matrix" | "executive";

export type Builder = {
  handle: string;
  displayName: string;
  tagline: string;
  bio: string;
  skills: string[];
  signatureProject: string;
  privacy: "public" | "private";
  campus?: string;
  deploys?: {
    pm?: string;
    comms?: string;
    showcase?: string;
  };
};

export type ShowcaseProject = {
  id: string;
  title: string;
  ownerHandle: string;
  problem: string;
  outcome: string;
  speedToMarket: string;
  complexity: string;
  deployUrl: string;
  repoUrl: string;
  stack: string[];
  previewGradient: string;
  architecture: ArchitectureNode[];
};

export type ArchitectureNode = {
  id: string;
  label: string;
  kind: "client" | "api" | "db" | "external" | "realtime";
  x: number;
  y: number;
};

export type ArchitectureEdge = {
  from: string;
  to: string;
  label?: string;
};

export type PulseEvent = {
  id: string;
  handle: string;
  message: string;
  when: string;
  kind: "commit" | "deploy" | "merge" | "ship";
};

export type PulseMetrics = {
  totalShips: number;
  combinedCommits: number;
  activeProjects: number;
  liveDeployments: number;
  cohortVelocity: number;
};

export type PmInitiative = {
  id: string;
  title: string;
  status: "done" | "on-track" | "at-risk" | "blocked";
  ownerHandle: string;
  openTasks: number;
  doneTasks: number;
};

export type PmSnapshot = {
  sourceLabel: string;
  sourceUrl: string;
  syncedAt: string;
  initiatives: PmInitiative[];
};

export type PartnerInterest =
  | "hire"
  | "sponsor"
  | "collaborate"
  | "sandbox-review";

export const PARTNER_INTEREST_OPTIONS: {
  value: PartnerInterest;
  label: string;
  description: string;
}[] = [
  {
    value: "hire",
    label: "Hire a Builder",
    description: "Full-time or contract engineering hire",
  },
  {
    value: "sponsor",
    label: "Sponsor a Project",
    description: "Fund a cohort sprint or capstone build",
  },
  {
    value: "collaborate",
    label: "Collaborate on a Sprint",
    description: "Co-build with a student team for 1–2 weeks",
  },
  {
    value: "sandbox-review",
    label: "Sandbox Code Review",
    description: "Request a scoped architecture or security review",
  },
];

export type QuickConnectAction = "resume" | "calendly" | "sandbox";
