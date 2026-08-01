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
      label: "Forth (PM) deploy",
      href: extras?.forthDeploy ?? forthUrl(),
      kind: "deploy",
    },
    {
      label: "Fireside (comms) deploy",
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

/** Summer Pilot roster — every enrolled participant has a page (opt-out → private). */
export const PEOPLE: Person[] = [
  makePerson({
    handle: "studmuffin01",
    name: "Rawle Arneaud",
    campus: "Boston",
    role: "Full-stack builder",
    initials: "RA",
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
      firesideDeploy: "https://hult-cohort-program-henna.vercel.app",
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
          label: "Live Summary rail",
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
          detail: "Hero, Live Summary, and profile layouts",
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
      liveAppUrl: "https://forth-bice.vercel.app",
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
    handle: "mayachen",
    name: "Maya Chen",
    campus: "Boston",
    role: "PM lead",
    initials: "MC",
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

export function allHandles(): string[] {
  return PEOPLE.map((p) => p.handle);
}

export const CAMPUSES = Array.from(new Set(PEOPLE.map((p) => p.campus))).sort();

export const ALL_SKILLS = Array.from(
  new Set(PEOPLE.flatMap((p) => p.skills))
).sort();
