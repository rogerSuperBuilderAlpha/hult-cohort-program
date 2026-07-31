import type {
  DeployStatus,
  ProofItem,
  ShowcaseMedia,
} from "@/lib/types";
import { firesideUrl, forthUrl } from "@/lib/links";

export type ProjectListStatus = "shipped" | "in-progress" | "planned";

export type ShowcaseProject = {
  id: string;
  name: string;
  phase: string;
  summary: string;
  tagline: string;
  status: ProjectListStatus;
  deployBadge: DeployStatus;
  ownerHandle: string;
  deployUrl?: string;
  repoUrl?: string;
  docsUrl?: string;
  /** ISO timestamp of last known deploy / major update */
  lastShippedAt?: string;
  problem: string;
  solutionItems: ShowcaseMedia[];
  proofOfWork: ProofItem[];
};

/** Cohort platforms — each has a public destination at /projects/[id]. */
export const PROJECTS: ShowcaseProject[] = [
  {
    id: "forth",
    name: "Forth (Initiara)",
    phase: "Phase 1 · Project 1",
    summary:
      "Cohort project-management platform — initiatives, tasks, roster assignment, and operator workflows.",
    tagline: "Initiative tracking the cohort can run every day.",
    status: "shipped",
    deployBadge: "live",
    ownerHandle: "studmuffin01",
    deployUrl: forthUrl(),
    repoUrl: "https://github.com/studmuffin01",
    docsUrl: "https://github.com/studmuffin01",
    lastShippedAt: "2026-07-22T21:00:00.000Z",
    problem:
      "Without a shared PM surface, deadlines and ownership live in chat threads. The cohort needed one place to track initiatives, assignees, and health before review week.",
    solutionItems: [
      {
        kind: "screenshot",
        label: "Executive summary",
        description: "Initiative health and task tables in one operator view.",
      },
      {
        kind: "architecture",
        label: "Auth + persistence",
        description: "Multi-user sessions with durable project data.",
      },
      {
        kind: "prototype",
        label: "Guest / demo path",
        description: "Reviewers can enter without fighting credentials.",
      },
      {
        kind: "video",
        label: "Operator walkthrough",
        description: "Create initiative → assign → filter → ship status.",
      },
    ],
    proofOfWork: [
      { label: "Demo video", detail: "Partner-facing walkthrough recorded" },
      { label: "User interviews", detail: "Peer feedback during review week" },
      { label: "Screenshots", detail: "Dashboard and initiative views" },
      { label: "Test results", detail: "Production build verified on Vercel" },
      { label: "Pilot outcomes", detail: "Live HTTPS deploy for cohort use" },
      {
        label: "Before / after",
        detail: "From scattered chat tasks to owned initiatives",
      },
    ],
  },
  {
    id: "fireside",
    name: "Fireside",
    phase: "Phase 1 · Project 2",
    summary:
      "Internal communications — channels, DMs, threads, and deep links into Forth tickets.",
    tagline: "Cohort chat that turns conversation into owned tickets.",
    status: "shipped",
    deployBadge: "live",
    ownerHandle: "studmuffin01",
    deployUrl: firesideUrl(),
    repoUrl: "https://github.com/studmuffin01",
    docsUrl: "https://github.com/studmuffin01",
    lastShippedAt: "2026-07-29T20:00:00.000Z",
    problem:
      "Discord-style noise buries work. Builders needed focused channels and a path from chat into the PM system without copy-paste chaos.",
    solutionItems: [
      {
        kind: "screenshot",
        label: "Channels + threads",
        description: "Topic rooms with async thread replies.",
      },
      {
        kind: "screenshot",
        label: "Forth ticket cards",
        description: "/ticket commands embed deep links into PM.",
      },
      {
        kind: "architecture",
        label: "Local demo workspace",
        description: "Typed workspace state with guest review path.",
      },
      {
        kind: "prototype",
        label: "Flag + AI coach",
        description: "Triage messages that need action.",
      },
    ],
    proofOfWork: [
      { label: "Demo video", detail: "Channel → thread → Forth link path" },
      { label: "User interviews", detail: "Peer testing during Project 2 week" },
      { label: "Screenshots", detail: "Sidebar, composer, ticket cards" },
      { label: "Test results", detail: "Lint + production build on Vercel" },
      { label: "Pilot outcomes", detail: "Public guest deploy for reviewers" },
      {
        label: "Before / after",
        detail: "Chat that creates tickets instead of losing them",
      },
    ],
  },
  {
    id: "lighthouse",
    name: "Lighthouse",
    phase: "Phase 1 · Project 3",
    summary:
      "Public hiring showcase — developer profiles, portfolio links, partner intros, and RSVP.",
    tagline: "Let partners inspect the work — not the pitch deck.",
    status: "in-progress",
    deployBadge: "beta",
    ownerHandle: "studmuffin01",
    repoUrl: "https://github.com/studmuffin01",
    docsUrl: "https://github.com/studmuffin01",
    lastShippedAt: "2026-07-30T22:00:00.000Z",
    problem:
      "Hiring partners cannot evaluate a cohort from PDFs. They need profiles, build logs, proof of work, and live deploys in one public place.",
    solutionItems: [
      {
        kind: "screenshot",
        label: "Developer profiles",
        description: "Why I'm Here, build log, and project proof on one page.",
      },
      {
        kind: "screenshot",
        label: "Live Summary",
        description: "Cohort metrics for developers, deploys, and partners.",
      },
      {
        kind: "architecture",
        label: "Public App Router site",
        description: "Next.js · Tailwind · seed data · Vercel-ready.",
      },
      {
        kind: "prototype",
        label: "Partner path",
        description: "Projects → people → request intro with interest type.",
      },
    ],
    proofOfWork: [
      { label: "Demo video", detail: "Partner walkthrough of showcase path" },
      { label: "User interviews", detail: "Feedback from Projects 1–2 reviews" },
      { label: "Screenshots", detail: "Hero, profiles, partners, testimonials" },
      { label: "Test results", detail: "Local production build path verified" },
      { label: "Pilot outcomes", detail: "Full Phase 1 story in one surface" },
      {
        label: "Before / after",
        detail: "From brochure cohort site to living studio signals",
      },
    ],
  },
  {
    id: "unification",
    name: "Ecosystem unification",
    phase: "Phase 1 · Week 5",
    summary:
      "Link PM, comms, and showcase into one operator ecosystem with shared navigation and identity.",
    tagline: "Three winners, one linked cohort stack.",
    status: "planned",
    deployBadge: "beta",
    ownerHandle: "mayachen",
    lastShippedAt: "2026-07-30T12:00:00.000Z",
    problem:
      "Winning platforms that do not link leave operators juggling logins and stale status. Unification week forces shared navigation and identity.",
    solutionItems: [
      {
        kind: "architecture",
        label: "Deep-link map",
        description: "PM ↔ comms ↔ showcase entry points.",
      },
      {
        kind: "prototype",
        label: "Shared identity sketch",
        description: "Same handle/email across apps.",
      },
      {
        kind: "screenshot",
        label: "Cross-nav mock",
        description: "Header links between the three platforms.",
      },
      {
        kind: "video",
        label: "Unification demo plan",
        description: "Walkthrough script for week-5 syncs.",
      },
    ],
    proofOfWork: [
      { label: "Demo video", detail: "Planned unification walkthrough" },
      { label: "User interviews", detail: "Operator sync notes (week 5)" },
      { label: "Screenshots", detail: "Nav and identity diagrams" },
      { label: "Test results", detail: "Link checklist across deploys" },
      { label: "Pilot outcomes", detail: "Migration plan for remainder of pilot" },
      {
        label: "Before / after",
        detail: "From three islands to one ecosystem",
      },
    ],
  },
  {
    id: "learning-app",
    name: "Phase 2 learning app",
    phase: "Phase 2",
    summary:
      "External-facing learning product with registered users via the Ludwitt/Hult metrics API.",
    tagline: "Ship a learning product with real external users.",
    status: "planned",
    deployBadge: "beta",
    ownerHandle: "jblake",
    lastShippedAt: "2026-07-28T15:00:00.000Z",
    problem:
      "Phase 2 requires proof beyond the cohort: a learning app with enough external users to show demand and retention signal.",
    solutionItems: [
      {
        kind: "prototype",
        label: "Learner flow",
        description: "Sign-up → lesson → progress.",
      },
      {
        kind: "architecture",
        label: "Metrics API hook",
        description: "Ludwitt/Hult registration and counts.",
      },
      {
        kind: "screenshot",
        label: "Dashboard mock",
        description: "Operator view of active learners.",
      },
      {
        kind: "video",
        label: "Pitch clip",
        description: "Why an outsider would open the app twice.",
      },
    ],
    proofOfWork: [
      { label: "Demo video", detail: "Early learner path recording" },
      { label: "User interviews", detail: "External tester conversations" },
      { label: "Screenshots", detail: "Core lesson screens" },
      { label: "Test results", detail: "API registration smoke tests" },
      { label: "Pilot outcomes", detail: "Target ≥25 external users" },
      {
        label: "Before / after",
        detail: "From cohort-only tools to public learners",
      },
    ],
  },
];

export function getProject(id: string): ShowcaseProject | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export function allProjectIds(): string[] {
  return PROJECTS.map((p) => p.id);
}

/** Most recent ship across projects (for home “last deployment”). */
export function getLastDeployment(): {
  project: ShowcaseProject;
  at: string;
} | null {
  const shipped = PROJECTS.filter((p) => p.lastShippedAt && p.deployUrl);
  if (shipped.length === 0) {
    const any = PROJECTS.filter((p) => p.lastShippedAt).sort(
      (a, b) =>
        new Date(b.lastShippedAt!).getTime() -
        new Date(a.lastShippedAt!).getTime()
    );
    if (!any[0]?.lastShippedAt) return null;
    return { project: any[0], at: any[0].lastShippedAt };
  }
  const sorted = [...shipped].sort(
    (a, b) =>
      new Date(b.lastShippedAt!).getTime() -
      new Date(a.lastShippedAt!).getTime()
  );
  return { project: sorted[0], at: sorted[0].lastShippedAt! };
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const mins = Math.max(0, Math.round((now - then) / 60_000));
  if (mins < 60) return `${mins || 1} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
