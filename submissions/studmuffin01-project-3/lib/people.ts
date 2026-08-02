import type {
  ActivityItem,
  BuildLogEntry,
  FeaturedProject,
  Person,
  ProjectLink,
  SocialLinks,
} from "@/lib/types";
import { firesideUrl, forthUrl, githubProfileUrl } from "@/lib/links";

function projectBundle(
  handle: string,
  extras?: {
    forthDeploy?: string;
    firesideDeploy?: string;
    showcaseDeploy?: string;
    forthLabel?: string;
    firesideLabel?: string;
  }
): ProjectLink[] {
  return [
    {
      label: "PM build repo",
      href: `https://github.com/${handle}/pm-${handle}`,
      kind: "repo",
    },
    {
      label: "Comms build repo",
      href: `https://github.com/${handle}/comms-${handle}`,
      kind: "repo",
    },
    {
      label: "Showcase build repo",
      href: `https://github.com/${handle}/showcase-${handle}`,
      kind: "repo",
    },
    {
      label: extras?.forthLabel ?? "Forth (PM) deploy",
      href: extras?.forthDeploy ?? forthUrl(),
      kind: "deploy",
    },
    {
      label: extras?.firesideLabel ?? "Fireside (comms) deploy",
      href: extras?.firesideDeploy ?? firesideUrl(),
      kind: "deploy",
    },
    ...(extras?.showcaseDeploy
      ? [
          {
            label: "Lighthouse deploy",
            href: extras.showcaseDeploy,
            kind: "deploy" as const,
          },
        ]
      : []),
  ];
}

function defaultBuildLog(role: string): BuildLogEntry[] {
  return [
    { week: "Week 1", title: "Completed problem discovery" },
    { week: "Week 2", title: `Built ${role.toLowerCase()} prototype` },
    { week: "Week 3", title: "Conducted user testing" },
    { week: "Week 4", title: "Shipped public showcase profile" },
  ];
}

function defaultActivity(handle: string): ActivityItem[] {
  return [
    {
      id: `${handle}-a1`,
      text: "New deployment",
      when: "3 hours ago",
    },
    {
      id: `${handle}-a2`,
      text: "Project presentation uploaded",
      when: "Yesterday",
    },
    {
      id: `${handle}-a3`,
      text: "Team completed user testing",
      when: "2 days ago",
    },
  ];
}

function defaultFeatured(
  handle: string,
  name: string,
  title: string,
  tagline: string,
  problem: string,
  status: FeaturedProject["status"] = "beta"
): FeaturedProject {
  return {
    title,
    tagline,
    problem,
    solutionItems: [
      {
        kind: "screenshot",
        label: "Product screenshot",
        description: "Primary workflow captured from the live deploy.",
      },
      {
        kind: "architecture",
        label: "Architecture sketch",
        description: "App Router UI · typed domain modules · Vercel deploy.",
      },
      {
        kind: "prototype",
        label: "Interactive prototype",
        description: "Clickable path partners can walk without credentials.",
      },
      {
        kind: "video",
        label: "Walkthrough",
        description: "Short demo of the happy path for hiring partners.",
      },
    ],
    proofOfWork: [
      { label: "Demo video", detail: "2–3 min partner walkthrough recorded" },
      { label: "User interviews", detail: "Peer + operator feedback sessions" },
      { label: "Screenshots", detail: "Key screens linked from this profile" },
      { label: "Test results", detail: "Lint + production build verified" },
      { label: "Pilot outcomes", detail: "Used by cohort reviewers in demo mode" },
      {
        label: "Before / after",
        detail: "From brief to HTTPS deploy in one sprint week",
      },
    ],
    liveAppUrl: forthUrl(),
    repoUrl: `https://github.com/${handle}`,
    docsUrl: `https://github.com/${handle}/pm-${handle}#readme`,
    status,
  };
}

function makePerson(input: {
  handle: string;
  name: string;
  campus: string;
  role: string;
  headline: string;
  whyImHere: string;
  skills: string[];
  privacy?: Person["privacy"];
  initials: string;
  isDemo?: boolean;
  links?: Partial<SocialLinks>;
  buildLog?: BuildLogEntry[];
  featuredProject?: FeaturedProject;
  activity?: ActivityItem[];
  projects?: ProjectLink[];
}): Person {
  const github = githubProfileUrl(input.handle);
  return {
    handle: input.handle,
    name: input.name,
    campus: input.campus,
    role: input.role,
    headline: input.headline,
    whyImHere: input.whyImHere,
    skills: input.skills,
    privacy: input.privacy ?? "public",
    photoInitials: input.initials,
    isDemo: input.isDemo,
    links: {
      github,
      linkedin: input.links?.linkedin ?? `https://www.linkedin.com/in/${input.handle}`,
      x: input.links?.x ?? `https://x.com/${input.handle}`,
      portfolio: input.links?.portfolio ?? github,
      deployment: input.links?.deployment ?? forthUrl(),
    },
    buildLog: input.buildLog ?? defaultBuildLog(input.role),
    featuredProject:
      input.featuredProject ??
      defaultFeatured(
        input.handle,
        input.name,
        `${input.name.split(" ")[0]}'s cohort build`,
        "Production work partners can inspect on GitHub.",
        "Hiring partners need evidence, not résumés. This build turns weekly ship pressure into a public trail of deploys, reviews, and operator-ready docs."
      ),
    activity: input.activity ?? defaultActivity(input.handle),
    projects: input.projects ?? projectBundle(input.handle),
  };
}

/**
 * Directory roster: real Summer Pilot builders (merged submissions + public deploys)
 * plus clearly flagged sample profiles so partners can still walk the UX.
 */
export const PEOPLE: Person[] = [
  makePerson({
    handle: "studmuffin01",
    name: "Rawle Arneaud",
    campus: "Boston",
    role: "Full-stack builder",
    initials: "RA",
    isDemo: false,
    headline:
      "Shipping Forth, Fireside, and Lighthouse — production systems the cohort can actually use.",
    whyImHere:
      "I'm exploring how digital tools and AI can improve operational reliability, safety, and maintenance effectiveness in industrial environments — and proving it by shipping production platforms under peer review.",
    skills: ["Next.js", "TypeScript", "Product", "Vercel"],
    links: {
      deployment: "https://forth-bice.vercel.app",
      portfolio: "https://forth-bice.vercel.app",
    },
    projects: projectBundle("studmuffin01", {
      forthDeploy: "https://forth-bice.vercel.app",
      firesideDeploy: "https://fireside-studmuffin01.vercel.app",
      showcaseDeploy: "https://lighthouse-studmuffin01.vercel.app",
    }),
    buildLog: [
      { week: "Week 1", title: "Completed problem discovery for cohort PM ops" },
      { week: "Week 2", title: "Built and deployed Forth (Initiara)" },
      { week: "Week 3", title: "Shipped Fireside with Forth deep links" },
      { week: "Week 4", title: "Building Lighthouse — public hiring showcase" },
    ],
    featuredProject: {
      title: "Lighthouse",
      tagline:
        "Public hiring showcase so partners inspect GitHub — not pitch decks.",
      problem:
        "Unplanned hiring risk is expensive: résumés hide weak execution. Partners need a single place to see real deploys, build logs, and proof of work before they request an intro.",
      solutionItems: [
        {
          kind: "screenshot",
          label: "Developer profile",
          description: "Why I'm Here, build log, and project showcase on one page.",
        },
        {
          kind: "screenshot",
          label: "Cohort Live rail",
          description: "Cohort metrics for developers, deploys, and partners.",
        },
        {
          kind: "architecture",
          label: "Signal / night stack",
          description: "Next.js App Router · typed seed data · Vercel HTTPS.",
        },
        {
          kind: "prototype",
          label: "Partner path",
          description: "Browse developers → open deploy → request intro.",
        },
      ],
      proofOfWork: [
        {
          label: "Demo video",
          detail: "Partner walkthrough of Lighthouse + Forth + Fireside",
        },
        {
          label: "User interviews",
          detail: "Peer review feedback on Project 1 & 2 deploys",
        },
        {
          label: "Screenshots",
          detail: "Hero, Cohort Live, and profile layouts",
        },
        {
          label: "Test results",
          detail: "Production builds verified for Forth and Fireside",
        },
        {
          label: "Pilot outcomes",
          detail: "Two Phase 1 platforms live on Vercel",
        },
        {
          label: "Before / after",
          detail: "From cohort brief to public HTTPS in compressed weeks",
        },
      ],
      liveAppUrl: "https://lighthouse-studmuffin01.vercel.app",
      repoUrl: "https://github.com/studmuffin01",
      docsUrl: "https://github.com/studmuffin01",
      status: "live",
    },
    activity: [
      { id: "ra1", text: "New deployment — Fireside production", when: "3 hours ago" },
      { id: "ra2", text: "Lighthouse profile showcase updated", when: "Yesterday" },
      { id: "ra3", text: "Team completed Project 2 peer testing", when: "2 days ago" },
    ],
  }),
  makePerson({
    handle: "nikjain15",
    name: "Nik Jain",
    campus: "Summer Pilot",
    role: "Full-stack builder",
    initials: "NJ",
    isDemo: false,
    headline:
      "Pulse + Rally — AI-first cohort PM and internal comms with public deploys.",
    whyImHere:
      "I build products where removing the model leaves nothing behind. Partners can open Pulse and Rally on Vercel and judge the work without a guided tour.",
    skills: ["Next.js", "Firebase", "AI product", "TypeScript"],
    links: {
      deployment: "https://pulsecohort.vercel.app",
      portfolio: "https://pulsecohort.vercel.app",
    },
    projects: [
      {
        label: "Pulse (PM) deploy",
        href: "https://pulsecohort.vercel.app",
        kind: "deploy",
      },
      {
        label: "Rally (comms) deploy",
        href: "https://rally-nikjain15.vercel.app",
        kind: "deploy",
      },
      {
        label: "GitHub",
        href: "https://github.com/nikjain15",
        kind: "repo",
      },
    ],
    buildLog: [
      { week: "Week 1", title: "Shipped Pulse — board that updates itself" },
      { week: "Week 2", title: "Peer review week on Project 1" },
      { week: "Week 3", title: "Shipped Rally internal communications" },
      { week: "Week 4", title: "Public deploys linked from cohort showcase" },
    ],
    featuredProject: {
      title: "Pulse",
      tagline: "The board that updates itself from real cohort work.",
      problem:
        "Task boards die when status is manual. Cohort work already lives in public repos — status should be sensed, not typed.",
      solutionItems: [
        {
          kind: "screenshot",
          label: "Pulse board",
          description: "Sense · Bank · Broker layers for cohort delivery.",
          href: "https://pulsecohort.vercel.app",
        },
        {
          kind: "prototype",
          label: "Rally",
          description: "Internal comms deploy for Project 2.",
          href: "https://rally-nikjain15.vercel.app",
        },
      ],
      proofOfWork: [
        {
          label: "Production PM",
          detail: "https://pulsecohort.vercel.app",
          href: "https://pulsecohort.vercel.app",
        },
        {
          label: "Production comms",
          detail: "https://rally-nikjain15.vercel.app",
          href: "https://rally-nikjain15.vercel.app",
        },
        {
          label: "Submission trail",
          detail: "Merged Project 1 & 2 PRs in the cohort monorepo",
        },
      ],
      liveAppUrl: "https://pulsecohort.vercel.app",
      repoUrl: "https://github.com/nikjain15",
      docsUrl: "https://github.com/nikjain15",
      status: "live",
    },
    activity: [
      { id: "nj1", text: "New deployment — Rally production", when: "Yesterday" },
      { id: "nj2", text: "Pulse production live for peer review", when: "2 days ago" },
    ],
  }),
  makePerson({
    handle: "lorra-v",
    name: "Lorra V",
    campus: "Summer Pilot",
    role: "Full-stack builder",
    initials: "LV",
    isDemo: false,
    headline:
      "Mission Control + Conexus — PM civilization tracker and cohort comms.",
    whyImHere:
      "I ship operator-ready systems with real auth and data models. Partners can open Mission Control and Conexus and evaluate execution directly.",
    skills: ["Next.js", "Supabase", "Product", "TypeScript"],
    links: {
      deployment: "https://mission-control-sandy-phi.vercel.app",
      portfolio: "https://mission-control-sandy-phi.vercel.app",
    },
    projects: [
      {
        label: "Mission Control (PM) deploy",
        href: "https://mission-control-sandy-phi.vercel.app",
        kind: "deploy",
      },
      {
        label: "Conexus (comms) deploy",
        href: "https://conexus-rust.vercel.app",
        kind: "deploy",
      },
      {
        label: "GitHub",
        href: "https://github.com/lorra-v",
        kind: "repo",
      },
    ],
    buildLog: [
      { week: "Week 1", title: "Shipped Mission Control civilization tracker" },
      { week: "Week 2", title: "Peer review and iteration on Project 1" },
      { week: "Week 3", title: "Shipped Conexus internal communications" },
      { week: "Week 4", title: "Public deploys linked from cohort showcase" },
    ],
    featuredProject: {
      title: "Mission Control",
      tagline: "Cohort civilization tracker with real tasks and PR evidence.",
      problem:
        "Cohorts lose motivation and clarity when progress is invisible. Operators need status tied to merged work, not slide decks.",
      solutionItems: [
        {
          kind: "screenshot",
          label: "Mission Control",
          description: "Dashboard, tasks, and civilization progression.",
          href: "https://mission-control-sandy-phi.vercel.app",
        },
        {
          kind: "prototype",
          label: "Conexus",
          description: "Internal communications platform for Project 2.",
          href: "https://conexus-rust.vercel.app",
        },
      ],
      proofOfWork: [
        {
          label: "Production PM",
          detail: "https://mission-control-sandy-phi.vercel.app",
          href: "https://mission-control-sandy-phi.vercel.app",
        },
        {
          label: "Production comms",
          detail: "https://conexus-rust.vercel.app",
          href: "https://conexus-rust.vercel.app",
        },
        {
          label: "Submission trail",
          detail: "Merged Project 1 & 2 PRs in the cohort monorepo",
        },
      ],
      liveAppUrl: "https://mission-control-sandy-phi.vercel.app",
      repoUrl: "https://github.com/lorra-v",
      docsUrl: "https://github.com/lorra-v",
      status: "live",
    },
    activity: [
      { id: "lv1", text: "New deployment — Conexus production", when: "Yesterday" },
      {
        id: "lv2",
        text: "Mission Control production live for peer review",
        when: "2 days ago",
      },
    ],
  }),
  makePerson({
    handle: "kiaracaesar5627",
    name: "Kiara Caesar",
    campus: "Summer Pilot",
    role: "Full-stack builder",
    initials: "KC",
    isDemo: false,
    headline:
      "FlexiFlow + Pilot Hult Comms — customizable PM and cohort messaging.",
    whyImHere:
      "I build flexible team systems — workspaces, roles, and automations partners can try on a public deploy without a sales call.",
    skills: ["Next.js", "Supabase", "Product ops", "TypeScript"],
    links: {
      deployment: "https://pilot-hult-pm.vercel.app",
      portfolio: "https://pilot-hult-pm.vercel.app",
    },
    projects: [
      {
        label: "FlexiFlow (PM) deploy",
        href: "https://pilot-hult-pm.vercel.app",
        kind: "deploy",
      },
      {
        label: "Pilot Hult Comms deploy",
        href: "https://pilot-hult-comms.vercel.app",
        kind: "deploy",
      },
      {
        label: "GitHub",
        href: "https://github.com/kiaracaesar5627",
        kind: "repo",
      },
    ],
    buildLog: [
      { week: "Week 1", title: "Shipped FlexiFlow customizable PM" },
      { week: "Week 2", title: "Peer review and iteration on Project 1" },
      { week: "Week 3", title: "Shipped Pilot Hult Comms" },
      { week: "Week 4", title: "Public deploys linked from cohort showcase" },
    ],
    featuredProject: {
      title: "FlexiFlow",
      tagline: "Customizable workspaces instead of one rigid PM workflow.",
      problem:
        "Teams abandon tools that force a single process. Cohort builders need statuses, roles, and views that match how they actually work.",
      solutionItems: [
        {
          kind: "screenshot",
          label: "FlexiFlow",
          description: "Workspaces, custom statuses, board/list/table views.",
          href: "https://pilot-hult-pm.vercel.app",
        },
        {
          kind: "prototype",
          label: "Pilot Hult Comms",
          description: "Internal communications deploy for Project 2.",
          href: "https://pilot-hult-comms.vercel.app",
        },
      ],
      proofOfWork: [
        {
          label: "Production PM",
          detail: "https://pilot-hult-pm.vercel.app",
          href: "https://pilot-hult-pm.vercel.app",
        },
        {
          label: "Production comms",
          detail: "https://pilot-hult-comms.vercel.app",
          href: "https://pilot-hult-comms.vercel.app",
        },
        {
          label: "Submission trail",
          detail: "Merged Project 1 & 2 PRs in the cohort monorepo",
        },
      ],
      liveAppUrl: "https://pilot-hult-pm.vercel.app",
      repoUrl: "https://github.com/kiaracaesar5627",
      docsUrl: "https://github.com/kiaracaesar5627",
      status: "live",
    },
    activity: [
      {
        id: "kc1",
        text: "New deployment — Pilot Hult Comms",
        when: "Yesterday",
      },
      {
        id: "kc2",
        text: "FlexiFlow production live for peer review",
        when: "2 days ago",
      },
    ],
  }),
  makePerson({
    handle: "mayachen",
    name: "Maya Chen",
    campus: "Boston",
    role: "PM lead",
    initials: "MC",
    isDemo: true,
    headline: "Initiative hygiene and review-week ops partners can trust.",
    whyImHere:
      "I want hiring partners to see operational clarity — status that matches the GitHub trail, not slides that age overnight.",
    skills: ["Product", "Ops", "React", "Facilitation"],
    featuredProject: defaultFeatured(
      "mayachen",
      "Maya Chen",
      "Review Week Ops Board",
      "Keeping peer review and vote windows visible under pressure.",
      "Cohorts lose signal when review work is scattered across chats. This board surfaces deadlines, blockers, and written-review completion so operators can intervene early."
    ),
  }),
  makePerson({
    handle: "jblake",
    name: "Jordan Blake",
    campus: "London",
    role: "Engineer",
    initials: "JB",
    isDemo: true,
    headline: "Backend-minded engineer — deploy URLs are the résumé.",
    whyImHere:
      "I'm here to prove reliability under review: honest scope, green builds, and APIs partners can trust in production.",
    skills: ["TypeScript", "APIs", "CI", "Postgres"],
  }),
  makePerson({
    handle: "sreyes",
    name: "Sofia Reyes",
    campus: "San Francisco",
    role: "Designer-engineer",
    initials: "SR",
    isDemo: true,
    headline: "Interfaces partners can scan in ten minutes.",
    whyImHere:
      "I ship production CSS with the same rigor as application logic — so a hiring manager can evaluate craft without a guided tour.",
    skills: ["UI", "CSS", "Accessibility", "Next.js"],
  }),
  makePerson({
    handle: "npatel",
    name: "Noah Patel",
    campus: "Dubai",
    role: "Engineer",
    initials: "NP",
    isDemo: true,
    headline: "Auth, data models, and painless demo accounts.",
    whyImHere:
      "I'm focused on making multi-user systems boringly dependable — reviewers should never fight the login screen.",
    skills: ["Auth", "Supabase", "Node", "Testing"],
  }),
  makePerson({
    handle: "alewis",
    name: "Ava Lewis",
    campus: "Boston",
    role: "Full-stack",
    initials: "AL",
    isDemo: true,
    headline: "Cohort tooling with unification-week hooks from day one.",
    whyImHere:
      "I'm building for the merge: shared identity and deep links so Phase 1 platforms become one ecosystem.",
    skills: ["Next.js", "Firebase", "DX"],
  }),
  makePerson({
    handle: "okim",
    name: "Owen Kim",
    campus: "London",
    role: "Engineer",
    initials: "OK",
    isDemo: true,
    headline: "Open-source oriented — profiles should read like commits.",
    whyImHere:
      "I want my public trail to be inspectable: merges, reviews, and upstream contributions over brochure copy.",
    skills: ["Git", "OSS", "Python", "TypeScript"],
  }),
  makePerson({
    handle: "priya",
    name: "Priya Nair",
    campus: "Dubai",
    role: "PM / builder",
    initials: "PN",
    isDemo: true,
    headline: "Delivery pressure with partner-facing clarity.",
    whyImHere:
      "I'm documenting decisions so operators can inherit systems — and so employers see judgment, not just features.",
    skills: ["Roadmaps", "Writing", "React"],
  }),
  makePerson({
    handle: "tomasz",
    name: "Tomasz Kowalski",
    campus: "London",
    role: "Engineer",
    initials: "TK",
    isDemo: true,
    headline: "Performance and observability first.",
    whyImHere:
      "A showcase should load fast on a partner's phone between meetings — I'm here to make that non-negotiable.",
    skills: ["Perf", "Next.js", "Observability"],
  }),
  makePerson({
    handle: "hana",
    name: "Hana Sato",
    campus: "San Francisco",
    role: "Full-stack",
    initials: "HS",
    isDemo: true,
    headline: "Small vertical slices, end-to-end.",
    whyImHere:
      "I write peer reviews with concrete deploy walkthroughs — the same standard I want partners to use on my work.",
    skills: ["TypeScript", "UX writing", "Vercel"],
  }),
  makePerson({
    handle: "diego",
    name: "Diego Morales",
    campus: "Boston",
    role: "Engineer",
    initials: "DM",
    isDemo: true,
    headline: "Integrations — PM status into public pages without fiction.",
    whyImHere:
      "I'm wiring real project data into the showcase so employers never see hardcoded lorem ipsum where status should live.",
    skills: ["Integrations", "JSON APIs", "React"],
  }),
  makePerson({
    handle: "elise",
    name: "Elise Martin",
    campus: "London",
    role: "Designer-engineer",
    initials: "EM",
    isDemo: true,
    privacy: "private",
    headline: "Quieter public footprint — still shipping.",
    whyImHere:
      "I opted out of a full public profile while contributing privately; placement can still route confidential intros.",
    skills: ["Design systems", "CSS", "Figma"],
  }),
];

export function getPerson(handle: string): Person | undefined {
  return PEOPLE.find((p) => p.handle.toLowerCase() === handle.toLowerCase());
}

export function publicPeople(): Person[] {
  return PEOPLE.filter((p) => p.privacy === "public");
}

/** Real enrolled builders only — safe for partner intro requests. */
export function introEligiblePeople(): Person[] {
  return PEOPLE.filter((p) => p.privacy === "public" && !p.isDemo);
}

export function isIntroEligible(person: Person): boolean {
  return person.privacy === "public" && !person.isDemo;
}

export function allHandles(): string[] {
  return PEOPLE.map((p) => p.handle);
}

export const CAMPUSES = Array.from(new Set(PEOPLE.map((p) => p.campus))).sort();

export const ALL_SKILLS = Array.from(
  new Set(PEOPLE.flatMap((p) => p.skills))
).sort();
