export type ProjectUpdate = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  achievements: string[];
  challenges: string[];
  lessons: string[];
  next_steps: string[];
  evidence_links: string[];
  created_at: string;
};
