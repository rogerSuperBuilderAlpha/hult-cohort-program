/**
 * Initiative definitions for the executive summary table and detail pages.
 */

export interface Initiative {
  slug: string;
  title: string;
  deadline: string;
}

export const initiatives: Initiative[] = [
  {
    slug: "week-1-project-management-platform",
    title: "Week 1 - Project Management Platform",
    deadline: "TBD",
  },
  {
    slug: "week-2-internal-communications-platform",
    title: "Week 2 - Internal Communications Platform",
    deadline: "TBD",
  },
  {
    slug: "week-3-vibe-marketing-platform",
    title: "Week 3 - Vibe Marketing Platform",
    deadline: "TBD",
  },
  {
    slug: "week-4-learning-engineer-integration-to-ludwitt",
    title: "Week 4 - Learning Engineer Integration To Ludwitt",
    deadline: "TBD",
  },
  {
    slug: "week-5-startup-entrepreneurship",
    title: "Week 5 - Startup/Entrepreneurship",
    deadline: "TBD",
  },
  {
    slug: "week-6-open-source-swarm",
    title: "Week 6 - Open Source Swarm",
    deadline: "TBD",
  },
];

export function getInitiativeBySlug(slug: string): Initiative | undefined {
  return initiatives.find((initiative) => initiative.slug === slug);
}

export function getInitiativeAnchorId(slug: string): string {
  return `initiative-${slug}`;
}
