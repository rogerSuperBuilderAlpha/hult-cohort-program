import type { ArchitectureEdge, ShowcaseProject } from "./types";
import { COHORT, URLS } from "./config";

export const ARCHITECTURE_EDGES: Record<string, ArchitectureEdge[]> = {
  pulse: [
    { from: "next", to: "api", label: "SSR / RSC" },
    { from: "api", to: "supabase", label: "partner inquiries" },
    { from: "api", to: "github", label: "live telemetry" },
    { from: "api", to: "forth", label: "PM snapshot" },
    { from: "next", to: "vercel", label: "edge deploy" },
  ],
  forth: [
    { from: "web", to: "api", label: "tasks" },
    { from: "api", to: "db", label: "Postgres" },
    { from: "web", to: "auth", label: "session" },
  ],
  comms: [
    { from: "client", to: "realtime", label: "postgres_changes" },
    { from: "client", to: "api", label: "server actions" },
    { from: "webhook", to: "api", label: "Forth events" },
    { from: "api", to: "db", label: "messages" },
  ],
};

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: "pulse",
    title: "Pulse · Cohort Telemetry Surface",
    ownerHandle: "solzco1",
    problem:
      "Hiring partners see sterile GitHub grids — no sense of cohort momentum or business outcomes.",
    outcome:
      "Live telemetry marketing engine converting partner curiosity into intro requests.",
    speedToMarket: "7-day contest window · production deploy day 6",
    complexity:
      "Multi-source integrations (PM, GitHub, Supabase), realtime ticker, vibe theming.",
    deployUrl: URLS.site,
    repoUrl: `https://github.com/${COHORT.org}/${COHORT.repo}/tree/main/submissions/solzco1-project-3`,
    stack: ["Next.js 14", "Supabase", "Tailwind", "GitHub API"],
    previewGradient: "from-indigo-600 via-violet-900 to-emerald-800",
    architecture: [
      { id: "next", label: "Next.js App", kind: "client", x: 10, y: 40 },
      { id: "api", label: "API Routes", kind: "api", x: 35, y: 40 },
      { id: "supabase", label: "Supabase", kind: "db", x: 60, y: 25 },
      { id: "github", label: "GitHub API", kind: "external", x: 60, y: 55 },
      { id: "forth", label: "Forth PM", kind: "external", x: 85, y: 40 },
      { id: "vercel", label: "Vercel Edge", kind: "client", x: 35, y: 70 },
    ],
  },
  {
    id: "forth",
    title: "Forth · Winning PM Platform",
    ownerHandle: "forth",
    problem: "Cohort needed shared task visibility across 30 parallel builds.",
    outcome: "Single source of truth for initiative status feeding showcase surfaces.",
    speedToMarket: "Week 2 ship · daily operator cadence",
    complexity: "Multi-tenant tasks, deadlines, cross-project reporting.",
    deployUrl: URLS.winningPm,
    repoUrl: "https://github.com/forth-bice/forth",
    stack: ["Next.js", "Postgres", "Auth"],
    previewGradient: "from-slate-800 via-blue-900 to-cyan-700",
    architecture: [
      { id: "web", label: "Web App", kind: "client", x: 15, y: 45 },
      { id: "api", label: "Task API", kind: "api", x: 45, y: 45 },
      { id: "db", label: "Database", kind: "db", x: 75, y: 45 },
      { id: "auth", label: "Auth", kind: "external", x: 45, y: 75 },
    ],
  },
  {
    id: "cohort-comms",
    title: "Cohort Comms · Winning Comms Platform",
    ownerHandle: "cohort-comms",
    problem: "Async coordination across time zones without losing context.",
    outcome: "Durable channels + DMs with PM deep links and webhook feeds.",
    speedToMarket: "Week 3 contest · realtime day 5",
    complexity: "RLS, Realtime listeners, webhook ingestion, search.",
    deployUrl: URLS.winningComms,
    repoUrl: `https://github.com/${COHORT.org}/${COHORT.repo}`,
    stack: ["Next.js", "Supabase Realtime", "Webhooks"],
    previewGradient: "from-emerald-900 via-teal-800 to-slate-900",
    architecture: [
      { id: "client", label: "Chat UI", kind: "client", x: 10, y: 40 },
      { id: "realtime", label: "Realtime", kind: "realtime", x: 40, y: 20 },
      { id: "api", label: "Server Actions", kind: "api", x: 40, y: 55 },
      { id: "webhook", label: "Forth Webhook", kind: "external", x: 70, y: 30 },
      { id: "db", label: "Postgres", kind: "db", x: 70, y: 60 },
    ],
  },
  {
    id: "sol-pm",
    title: "Sol PM · Parallel PM Build",
    ownerHandle: "solzco1",
    problem: "Operator-grade task board for personal cohort workflow.",
    outcome: "Production PM deploy integrated with Pulse telemetry.",
    speedToMarket: "Week 2 · iterative PR merges",
    complexity: "Kanban, auth, deploy pipeline.",
    deployUrl: URLS.solPm,
    repoUrl: "https://github.com/solzco1/pm-solzco1",
    stack: ["Next.js", "Vercel"],
    previewGradient: "from-amber-900 via-orange-950 to-stone-900",
    architecture: [
      { id: "web", label: "Dashboard", kind: "client", x: 20, y: 45 },
      { id: "api", label: "Tasks API", kind: "api", x: 55, y: 45 },
      { id: "db", label: "Data Store", kind: "db", x: 80, y: 45 },
    ],
  },
];

export function getProject(id: string): ShowcaseProject | undefined {
  return SHOWCASE_PROJECTS.find((p) => p.id === id);
}

export function getProjectEdges(id: string): ArchitectureEdge[] {
  return ARCHITECTURE_EDGES[id] ?? [];
}
