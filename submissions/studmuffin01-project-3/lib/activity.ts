import { PEOPLE } from "@/lib/people";
import { PROJECTS, formatRelativeTime } from "@/lib/projects";

export type CohortActivity = {
  id: string;
  text: string;
  when: string;
  /** Sort key — higher = more recent for seeded relative labels */
  rank: number;
  href?: string;
};

const RELATIVE_RANK: Record<string, number> = {
  "3 hours ago": 90,
  "Yesterday": 50,
  "2 days ago": 30,
};

/**
 * Cohort-wide activity stream — profile feeds + project ship signals.
 */
export function getCohortActivity(): CohortActivity[] {
  const fromPeople: CohortActivity[] = PEOPLE.filter(
    (p) => p.privacy === "public"
  ).flatMap((person) =>
    person.activity.map((item, index) => ({
      id: item.id,
      text: `${item.text} · @${person.handle}`,
      when: item.when,
      rank: (RELATIVE_RANK[item.when] ?? 10) - index,
      href: `/developers/${person.handle}`,
    }))
  );

  const fromProjects: CohortActivity[] = PROJECTS.filter(
    (p) => p.status === "shipped" || p.status === "in-progress"
  ).map((project, index) => ({
    id: `proj-${project.id}`,
    text: project.deployUrl
      ? `New deployment — ${project.name}`
      : `Project update — ${project.name}`,
    when: project.lastShippedAt
      ? formatRelativeTime(project.lastShippedAt)
      : "Recently",
    rank: 80 - index * 5,
    href: `/projects/${project.id}`,
  }));

  return [...fromPeople, ...fromProjects]
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 12);
}

export const JOURNEY_STEPS = [
  { id: "launch", label: "Launch" },
  { id: "discovery", label: "Discovery" },
  { id: "building", label: "Building" },
  { id: "testing", label: "Testing" },
  { id: "deployment", label: "Deployment" },
  { id: "demo-day", label: "Demo Day" },
] as const;

/** Summer Pilot is mid Phase 1 Project 3 — highlight Building → Testing. */
export const JOURNEY_CURRENT_INDEX = 2;
