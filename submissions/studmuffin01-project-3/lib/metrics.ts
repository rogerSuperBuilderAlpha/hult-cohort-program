import { INDUSTRY_PARTNERS } from "@/lib/industry-partners";
import { PEOPLE } from "@/lib/people";
import { pmSnapshot } from "@/lib/pm-snapshot";
import { PROJECTS } from "@/lib/projects";

export type LiveMetric = {
  id: string;
  label: string;
  value: number;
  href?: string;
};

export type LiveMetrics = {
  updatedAt: string;
  items: LiveMetric[];
};

/** Derive Live Summary numbers from current app data. */
export function getLiveMetrics(): LiveMetrics {
  const developers = PEOPLE.length;

  const buildRepos = PEOPLE.reduce(
    (sum, person) =>
      sum + person.projects.filter((link) => link.kind === "repo").length,
    0
  );
  const activePlatforms = PROJECTS.filter(
    (project) => project.status === "shipped" || project.status === "in-progress"
  ).length;
  const activePm = pmSnapshot.initiatives.filter(
    (item) => item.status === "on-track" || item.status === "at-risk"
  ).length;
  const activeProjects = buildRepos + activePlatforms + activePm;

  const deployedFromProfiles = PEOPLE.reduce(
    (sum, person) =>
      sum + person.projects.filter((link) => link.kind === "deploy").length,
    0
  );
  const deployedPlatforms = PROJECTS.filter((project) =>
    Boolean(project.deployUrl)
  ).length;
  const deployedProducts = deployedFromProfiles + deployedPlatforms;

  const industryPartners = INDUSTRY_PARTNERS.length;
  const publicProfiles = PEOPLE.filter((p) => p.privacy === "public").length;

  return {
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: "developers",
        label: "Developers",
        value: developers,
        href: "/developers",
      },
      {
        id: "active-projects",
        label: "Active projects",
        value: activeProjects,
        href: "/projects",
      },
      {
        id: "deployed-products",
        label: "Deployed products",
        value: deployedProducts,
        href: "/projects",
      },
      {
        id: "industry-partners",
        label: "Industry partners",
        value: industryPartners,
        href: "/partners",
      },
      {
        id: "public-profiles",
        label: "Public profiles",
        value: publicProfiles,
        href: "/developers",
      },
    ],
  };
}
