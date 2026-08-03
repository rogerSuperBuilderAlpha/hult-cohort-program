export type Campus =
  | "Boston"
  | "London"
  | "San Francisco"
  | "Dubai"
  | "Online";

export type ProjectLink = {
  slug: "pm" | "comms" | "showcase" | "learning" | "venture" | "oss";
  label: string;
  repoUrl?: string;
  deployUrl?: string;
};

export type Participant = {
  handle: string;
  name: string;
  campus: Campus;
  bio: string;
  skills: string[];
  /** Default opt-in; false hides public detail behind a private placeholder */
  publicProfile: boolean;
  avatarUrl?: string;
  projects: ProjectLink[];
  highlight?: string;
};

export type PmProjectStatus = {
  id: string;
  name: string;
  status: "on-track" | "at-risk" | "blocked" | "shipped";
  ownerHandle: string;
  progress: number;
  updatedAt: string;
};

export type PmSnapshot = {
  source: string;
  syncedAt: string;
  note: string;
  projects: PmProjectStatus[];
};
