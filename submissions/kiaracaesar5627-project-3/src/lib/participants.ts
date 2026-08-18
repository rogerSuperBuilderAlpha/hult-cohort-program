import type { Campus, Participant, ProjectLink } from "@/lib/types";
import { commsUrl, pmUrl, siteUrl } from "@/lib/site";

const CAMPUSES: Campus[] = [
  "Boston",
  "London",
  "San Francisco",
  "Dubai",
  "Online",
];

const SKILL_POOL = [
  "Next.js",
  "TypeScript",
  "React",
  "Product",
  "Systems",
  "Design",
  "Open source",
  "Agent workflows",
  "APIs",
  "DevOps",
];

const FIRST = [
  "Alex",
  "Jordan",
  "Sam",
  "Priya",
  "Marcus",
  "Taylor",
  "Riley",
  "Casey",
  "Morgan",
  "Quinn",
  "Avery",
  "Blake",
  "Cameron",
  "Drew",
  "Elliot",
  "Finley",
  "Gray",
  "Harper",
  "Indigo",
  "Jamie",
  "Kai",
  "Logan",
  "Maya",
  "Noah",
  "Olivia",
  "Parker",
  "Reese",
  "Sage",
  "Tatum",
];

const LAST = [
  "Rivera",
  "Lee",
  "Chen",
  "Patel",
  "Johnson",
  "Kim",
  "Nguyen",
  "Martinez",
  "Brown",
  "Wilson",
  "Garcia",
  "Singh",
  "Okafor",
  "Ali",
  "Santos",
  "Murphy",
  "Cohen",
  "Park",
  "Dubois",
  "Ahmed",
  "Torres",
  "Brooks",
  "Foster",
  "Hayes",
  "Reed",
  "Bennett",
  "Howard",
  "Long",
  "Price",
];

function projectBundle(handle: string, index: number): ProjectLink[] {
  const base: ProjectLink[] = [
    {
      slug: "pm" as const,
      label: "Project management",
      repoUrl: `https://github.com/${handle}/pm-platform`,
      deployUrl: index % 5 === 0 ? pmUrl() : undefined,
    },
    {
      slug: "comms" as const,
      label: "Internal comms",
      repoUrl: `https://github.com/${handle}/comms-platform`,
      deployUrl: index % 7 === 0 ? commsUrl() : undefined,
    },
    {
      slug: "showcase" as const,
      label: "Public showcase",
      repoUrl: `https://github.com/${handle}/showcase-platform`,
      deployUrl: index === 0 ? siteUrl() : undefined,
    },
  ];
  if (index % 4 === 0) {
    base.push({
      slug: "learning",
      label: "Phase 2 learning app",
      repoUrl: `https://github.com/${handle}/learning-app`,
    });
  }
  return base;
}

function demoParticipant(i: number): Participant {
  const first = FIRST[i % FIRST.length];
  const last = LAST[i % LAST.length];
  const suffix = String(i + 1).padStart(2, "0");
  const handle = `demo-${first.toLowerCase()}-${last.toLowerCase()}-${suffix}`;
  const skills = [
    SKILL_POOL[i % SKILL_POOL.length],
    SKILL_POOL[(i + 3) % SKILL_POOL.length],
    SKILL_POOL[(i + 5) % SKILL_POOL.length],
  ];
  return {
    handle,
    name: `${first} ${last}`,
    campus: CAMPUSES[i % CAMPUSES.length],
    bio: `${first} ships production software under peer review. Summer Pilot work spans project systems, cohort communications, and public evidence partners can verify on GitHub.`,
    skills,
    publicProfile: i !== 11, // one opt-out demo
    avatarUrl: `https://avatars.githubusercontent.com/u/${10000 + i}?v=4`,
    projects: projectBundle(handle, i),
    highlight:
      i % 3 === 0
        ? "Operating a live cohort platform under real deadlines."
        : i % 3 === 1
          ? "Strong peer-review trail across Phase 1 contests."
          : "Building agent-assisted workflows that stay reviewable.",
  };
}

const AUTHOR: Participant = {
  handle: "kiaracaesar5627",
  name: "Kiara Caesar",
  campus: "Boston",
  bio: "Builder of FlexiFlow (PM), Huddle (comms), and Trailmark — the cohort's public marketing surface. Focused on production UX, ecosystem hooks between platforms, and partner-readable evidence.",
  skills: ["Next.js", "TypeScript", "Product", "Agent workflows", "Systems"],
  publicProfile: true,
  avatarUrl: "https://avatars.githubusercontent.com/kiaracaesar5627",
  projects: [
    {
      slug: "pm",
      label: "FlexiFlow — PM platform",
      repoUrl:
        "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/tree/main/submissions/kiaracaesar5627-project-1",
      deployUrl: pmUrl(),
    },
    {
      slug: "comms",
      label: "Huddle — internal comms",
      repoUrl:
        "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/tree/main/submissions/kiaracaesar5627-project-2",
      deployUrl: commsUrl(),
    },
    {
      slug: "showcase",
      label: "Trailmark — public showcase",
      repoUrl:
        "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/tree/main/submissions/kiaracaesar5627-project-3",
      deployUrl: siteUrl(),
    },
  ],
  highlight: "End-to-end Phase 1 stack: PM → comms → public Trailmark.",
};

export const PARTICIPANTS: Participant[] = [
  AUTHOR,
  ...Array.from({ length: 29 }, (_, i) => demoParticipant(i)),
];

export function getParticipant(handle: string) {
  const key = handle.toLowerCase();
  return PARTICIPANTS.find((p) => p.handle.toLowerCase() === key) ?? null;
}

export function publicParticipants() {
  return PARTICIPANTS.filter((p) => p.publicProfile);
}

export function allSkills() {
  return Array.from(
    new Set(PARTICIPANTS.flatMap((p) => (p.publicProfile ? p.skills : []))),
  ).sort();
}
