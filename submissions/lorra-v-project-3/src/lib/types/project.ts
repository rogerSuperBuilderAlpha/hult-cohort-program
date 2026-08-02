export type ProjectStage =
  | "idea"
  | "building"
  | "launched"
  | "pilot"
  | "scaling";

export type ProjectStatus = "draft" | "published" | "unpublished";

export type Project = {
  id: string;
  cohort_id: string;
  owner_id: string;
  name: string;
  slug: string;
  tagline: string | null;
  summary: string | null;
  description: string | null;
  problem: string | null;
  solution: string | null;
  target_audience: string | null;
  technology_stack: string[];
  stage: ProjectStage;
  live_url: string | null;
  github_url: string | null;
  demo_url: string | null;
  image_url: string | null;
  needs: string[];
  sectors: string[];
  status: ProjectStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
};
