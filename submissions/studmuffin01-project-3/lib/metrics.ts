import { INDUSTRY_PARTNERS } from "@/lib/industry-partners";
import { PEOPLE } from "@/lib/people";
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
  const realDevelopers = PEOPLE.filter((p) => !p.isDemo).length;
  const sampleDevelopers = PEOPLE.filter((p) => p.isDemo).length;

  const buildRepos = PEOPLE.filter((p) => !p.isDemo).reduce(
    (sum, person) =>
      sum + person.projects.filter((link) => link.kind === "repo").length,
    0
  );
  const activePlatforms = PROJECTS.filter(
    (project) => project.status === "shipped" || project.status === "in-progress"
  ).length;
  // Platform + real profile repos only — exclude illustrative PM snapshot rows.
  const activeProjects = buildRepos + activePlatforms;

  const deployedFromProfiles = PEOPLE.filter((p) => !p.isDemo).reduce(
    (sum, person) =>
      sum + person.projects.filter((link) => link.kind === "deploy").length,
    0
  );
  const deployedPlatforms = PROJECTS.filter((project) =>
    Boolean(project.deployUrl)
  ).length;
  const deployedProducts = deployedFromProfiles + deployedPlatforms;

  const industryPartners = INDUSTRY_PARTNERS.length;
  const publicProfiles = PEOPLE.filter(
    (p) => p.privacy === "public" && !p.isDemo
  ).length;

  return {
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: "developers",
        label: `Developers (${sampleDevelopers} sample)`,
        value: realDevelopers,
        href: "/developers",
      },
      {
        id: "active-projects",
        label: "Active projects (real)",
        value: activeProjects,
        href: "/projects",
      },
      {
        id: "deployed-products",
        label: "Deployed (real profiles)",
        value: deployedProducts,
        href: "/projects",
      },
      {
        id: "industry-partners",
        label: "Partners (sample)",
        value: industryPartners,
        href: "/partners",
      },
      {
        id: "public-profiles",
        label: "Real public profiles",
        value: publicProfiles,
        href: "/developers",
      },
    ],
  };
}
