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

/** Sample profiles: no fake repos, PoW, or social URLs that resolve to strangers. */
function demoFeatured(name: string): FeaturedProject {
  return {
    title: `${name.split(" ")[0]}'s sample profile`,
    tagline: "Directory filler for UX walkthroughs — not a real cohort submission.",
    problem:
      "Partners need enough rows to exercise filters and layout without mistaking fiction for peer work.",
    solutionItems: [],
    proofOfWork: [],
    status: "beta",
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
  const isDemo = Boolean(input.isDemo);
  const github = isDemo
    ? input.links?.github
    : (input.links?.github ?? githubProfileUrl(input.handle));

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
    links: isDemo
      ? {
          github,
          linkedin: input.links?.linkedin,
          x: input.links?.x,
          portfolio: input.links?.portfolio,
          deployment: input.links?.deployment,
        }
      : {
          github,
          linkedin:
            input.links?.linkedin ??
            `https://www.linkedin.com/in/${input.handle}`,
          x: input.links?.x ?? `https://x.com/${input.handle}`,
          portfolio: input.links?.portfolio ?? github,
          deployment: input.links?.deployment ?? forthUrl(),
        },
    buildLog: input.buildLog ?? (isDemo
      ? [
          {
            week: "Sample",
            title: "Illustrative build log — not real cohort work",
          },
        ]
      : defaultBuildLog(input.role)),
    featuredProject:
      input.featuredProject ??
      (isDemo
        ? demoFeatured(input.name)
        : defaultFeatured(
            input.handle,
            input.name,
            `${input.name.split(" ")[0]}'s cohort build`,
            "Production work partners can inspect on GitHub.",
            "Hiring partners need evidence, not résumés. This build turns weekly ship pressure into a public trail of deploys, reviews, and operator-ready docs."
          )),
    activity: input.activity ?? (isDemo ? [] : defaultActivity(input.handle)),
    projects: input.projects ?? (isDemo ? [] : projectBundle(input.handle)),
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
      "Pulse, Rally, and Hallmark — PM, comms, and an independent cohort assay.",
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
        label: "Hallmark (showcase) deploy",
        href: "https://hallmark.vercel.app",
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
      { week: "Week 2", title: "Shipped Rally internal communications" },
      { week: "Week 3", title: "Shipped Hallmark cohort assay (Project 3)" },
      { week: "Week 4", title: "Merged Project 3 PR — live on Vercel" },
    ],
    featuredProject: {
      title: "Hallmark",
      tagline: "Independent assay of the cohort — ship · live · docs · open.",
      problem:
        "Partners need identical evidence checks across builders, not self-reported portfolios.",
      solutionItems: [
        {
          kind: "screenshot",
          label: "Hallmark",
          description: "Four automated marks from GitHub + production probes.",
          href: "https://hallmark.vercel.app",
        },
        {
          kind: "prototype",
          label: "Pulse + Rally",
          description: "Earlier Phase 1 PM and comms deploys.",
          href: "https://pulsecohort.vercel.app",
        },
      ],
      proofOfWork: [
        {
          label: "Production showcase",
          detail: "https://hallmark.vercel.app",
          href: "https://hallmark.vercel.app",
        },
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
          detail: "Merged Project 1–3 PRs in the cohort monorepo",
        },
      ],
      liveAppUrl: "https://hallmark.vercel.app",
      repoUrl: "https://github.com/nikjain15",
      docsUrl: "https://github.com/nikjain15",
      status: "live",
    },
    activity: [
      { id: "nj1", text: "New deployment — Hallmark production", when: "3 hours ago" },
      { id: "nj2", text: "Merged Project 3 submission PR", when: "Yesterday" },
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
      "Mission Control, Conexus, and Comentiq — PM, comms, and partner showcase.",
    whyImHere:
      "I ship operator-ready systems with real auth and data models. Partners can open Mission Control, Conexus, and Comentiq and evaluate execution directly.",
    skills: ["Next.js", "Supabase", "Product", "TypeScript"],
    links: {
      deployment: "https://hult-cohort-program-one.vercel.app",
      portfolio: "https://hult-cohort-program-one.vercel.app",
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
        label: "Comentiq (showcase) deploy",
        href: "https://hult-cohort-program-one.vercel.app",
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
      { week: "Week 2", title: "Shipped Conexus internal communications" },
      { week: "Week 3", title: "Shipped Comentiq partner showcase (Project 3)" },
      { week: "Week 4", title: "Merged Project 3 PR — live on Vercel" },
    ],
    featuredProject: {
      title: "Comentiq",
      tagline: "Evidence-based campaign stories from builder progress.",
      problem:
        "Cohorts lose partner attention when progress stays buried in repos. Operators need public stories grounded in shipped work.",
      solutionItems: [
        {
          kind: "screenshot",
          label: "Comentiq",
          description: "AI-assisted campaign drafts from real project updates.",
          href: "https://hult-cohort-program-one.vercel.app",
        },
        {
          kind: "prototype",
          label: "Mission Control + Conexus",
          description: "Earlier Phase 1 PM and comms deploys.",
          href: "https://mission-control-sandy-phi.vercel.app",
        },
      ],
      proofOfWork: [
        {
          label: "Production showcase",
          detail: "https://hult-cohort-program-one.vercel.app",
          href: "https://hult-cohort-program-one.vercel.app",
        },
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
          detail: "Merged Project 1–3 PRs in the cohort monorepo",
        },
      ],
      liveAppUrl: "https://hult-cohort-program-one.vercel.app",
      repoUrl: "https://github.com/lorra-v",
      docsUrl: "https://github.com/lorra-v",
      status: "live",
    },
    activity: [
      { id: "lv1", text: "New deployment — Comentiq production", when: "3 hours ago" },
      { id: "lv2", text: "Merged Project 3 submission PR", when: "Yesterday" },
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
    handle: "solzco1",
    name: "Solzco",
    campus: "Summer Pilot",
    role: "Full-stack builder",
    initials: "SO",
    isDemo: false,
    headline:
      "Pulse — vibe marketing showcase with live cohort telemetry.",
    whyImHere:
      "I build partner-facing surfaces that feel alive — heartbeat metrics, builder profiles, and intros tied to real Phase 1 deploys.",
    skills: ["Next.js", "Supabase", "Product", "Marketing"],
    links: {
      deployment: "https://pulse-ten-theta.vercel.app",
      portfolio: "https://pulse-ten-theta.vercel.app",
    },
    projects: [
      {
        label: "Pulse showcase deploy",
        href: "https://pulse-ten-theta.vercel.app",
        kind: "deploy",
      },
      {
        label: "Sol PM deploy",
        href: "https://solzpm.vercel.app",
        kind: "deploy",
      },
      {
        label: "Sol Comms deploy",
        href: "https://solforth.vercel.app",
        kind: "deploy",
      },
      {
        label: "GitHub",
        href: "https://github.com/solzco1",
        kind: "repo",
      },
    ],
    buildLog: [
      { week: "Week 1", title: "Shipped Sol PM platform" },
      { week: "Week 2", title: "Shipped Sol Comms" },
      { week: "Week 3", title: "Shipped Pulse vibe marketing (Project 3)" },
      { week: "Week 4", title: "Merged Project 3 PR — live on Vercel" },
    ],
    featuredProject: {
      title: "Pulse",
      tagline: "Live telemetry showcase for the Summer Pilot cohort.",
      problem:
        "Hiring partners bounce when a cohort site feels like a static directory. They need heartbeat and proof they can open.",
      solutionItems: [
        {
          kind: "screenshot",
          label: "Pulse",
          description: "Ticker, builder profiles, partner portal.",
          href: "https://pulse-ten-theta.vercel.app",
        },
      ],
      proofOfWork: [
        {
          label: "Production showcase",
          detail: "https://pulse-ten-theta.vercel.app",
          href: "https://pulse-ten-theta.vercel.app",
        },
        {
          label: "Merged Project 3 PR",
          detail: "solzco1 submission in cohort monorepo",
        },
      ],
      liveAppUrl: "https://pulse-ten-theta.vercel.app",
      repoUrl: "https://github.com/solzco1",
      docsUrl: "https://github.com/solzco1",
      status: "live",
    },
    activity: [
      { id: "so1", text: "New deployment — Pulse production", when: "3 hours ago" },
      { id: "so2", text: "Merged Project 3 submission PR", when: "Yesterday" },
    ],
  }),
  makePerson({
    handle: "arjun-singh2127",
    name: "Arjun Singh",
    campus: "Summer Pilot",
    role: "Full-stack builder",
    initials: "AS",
    isDemo: false,
    headline:
      "Good Vibes — studio collective showcase driven by live GitHub roster data.",
    whyImHere:
      "I refuse fabricated bios. Good Vibes reads handles from real submission PRs and hydrates names, avatars, and merges from the GitHub API.",
    skills: ["Next.js", "GitHub API", "Product", "Design systems"],
    links: {
      deployment: "https://good-vibes-zeta.vercel.app",
      portfolio: "https://good-vibes-zeta.vercel.app",
    },
    projects: [
      {
        label: "Good Vibes deploy",
        href: "https://good-vibes-zeta.vercel.app",
        kind: "deploy",
      },
      {
        label: "Build repo",
        href: "https://github.com/arjun-singh2127/Good-Vibes",
        kind: "repo",
      },
    ],
    buildLog: [
      { week: "Week 1–2", title: "Phase 1 builds + peer review" },
      { week: "Week 3", title: "Shipped Good Vibes (Project 3)" },
      { week: "Week 4", title: "Merged Project 3 PR — live GitHub roster" },
    ],
    featuredProject: {
      title: "Good Vibes",
      tagline: "We don't pitch decks. We ship software.",
      problem:
        "Static directories invent people. Partners need a collective roster backed by merged PRs and live GitHub facts.",
      solutionItems: [
        {
          kind: "screenshot",
          label: "Builders directory",
          description: "Alphabetical roster hydrated from GitHub.",
          href: "https://good-vibes-zeta.vercel.app/builders",
        },
      ],
      proofOfWork: [
        {
          label: "Production",
          detail: "https://good-vibes-zeta.vercel.app",
          href: "https://good-vibes-zeta.vercel.app",
        },
        {
          label: "Merged Project 3 PR",
          detail: "#209 in cohort monorepo",
        },
      ],
      liveAppUrl: "https://good-vibes-zeta.vercel.app",
      repoUrl: "https://github.com/arjun-singh2127/Good-Vibes",
      docsUrl: "https://github.com/arjun-singh2127/Good-Vibes#readme",
      status: "live",
    },
    activity: [
      {
        id: "as1",
        text: "New deployment — Good Vibes production",
        when: "3 hours ago",
      },
      { id: "as2", text: "Merged Project 3 submission PR", when: "Yesterday" },
    ],
  }),
  makePerson({
    handle: "celiciakitty-creator",
    name: "Celicia",
    campus: "Summer Pilot",
    role: "Full-stack builder",
    initials: "CA",
    isDemo: false,
    headline:
      "Cohort in Bloom — garden-inspired public marketing platform for partners.",
    whyImHere:
      "I want partners to discover builders the way a garden grows — profiles, projects, and collaboration paths that feel welcoming and real.",
    skills: ["Next.js", "Supabase", "UI", "TypeScript"],
    links: {
      deployment: "https://cohort-in-bloom.vercel.app",
      portfolio: "https://cohort-in-bloom.vercel.app",
    },
    projects: [
      {
        label: "Cohort in Bloom deploy",
        href: "https://cohort-in-bloom.vercel.app",
        kind: "deploy",
      },
      {
        label: "Build repo",
        href: "https://github.com/celiciakitty-creator/cohort-in-bloom",
        kind: "repo",
      },
    ],
    buildLog: [
      { week: "Week 3", title: "Shipped Cohort in Bloom (Project 3)" },
      { week: "Week 4", title: "Merged Project 3 PR — live on Vercel" },
    ],
    featuredProject: {
      title: "Cohort in Bloom",
      tagline: "A living digital garden for cohort discovery.",
      problem:
        "Cold directories hide emerging talent. Partners need a warm public surface to browse people and projects.",
      solutionItems: [
        {
          kind: "screenshot",
          label: "Participants",
          description: "Public participant and project routes.",
          href: "https://cohort-in-bloom.vercel.app",
        },
      ],
      proofOfWork: [
        {
          label: "Production",
          detail: "https://cohort-in-bloom.vercel.app",
          href: "https://cohort-in-bloom.vercel.app",
        },
        {
          label: "Merged Project 3 PR",
          detail: "#210 in cohort monorepo",
        },
      ],
      liveAppUrl: "https://cohort-in-bloom.vercel.app",
      repoUrl: "https://github.com/celiciakitty-creator/cohort-in-bloom",
      docsUrl:
        "https://github.com/celiciakitty-creator/cohort-in-bloom/blob/main/docs/PARTNER_README.md",
      status: "live",
    },
    activity: [
      {
        id: "ca1",
        text: "New deployment — Cohort in Bloom",
        when: "3 hours ago",
      },
      { id: "ca2", text: "Merged Project 3 submission PR", when: "Yesterday" },
    ],
  }),
  makePerson({
    handle: "jiaxinaspenlin-dotcom",
    name: "Aspen Lin",
    campus: "Summer Pilot",
    role: "Full-stack builder",
    initials: "AL",
    isDemo: false,
    headline:
      "Signal Atlas — talent universe with published stars and no rankings.",
    whyImHere:
      "I build discovery surfaces partners can trust: nothing public until reviewed, nothing scored or ranked, every star linked to real work.",
    skills: ["Next.js", "Postgres", "Accessibility", "Product"],
    links: {
      deployment: "https://signal-atlas-omega.vercel.app",
      portfolio: "https://signal-atlas-omega.vercel.app",
    },
    projects: [
      {
        label: "Signal Atlas deploy",
        href: "https://signal-atlas-omega.vercel.app",
        kind: "deploy",
      },
      {
        label: "Build repo",
        href: "https://github.com/jiaxinaspenlin-dotcom/signal-atlas",
        kind: "repo",
      },
    ],
    buildLog: [
      { week: "Week 1–2", title: "Phase 1 builds (Grow Sprout, Ember)" },
      { week: "Week 3", title: "Shipped Signal Atlas (Project 3)" },
      { week: "Week 4", title: "Merged Project 3 PR — live on Vercel" },
    ],
    featuredProject: {
      title: "Signal Atlas",
      tagline: "Navigable talent universe — no ranking model.",
      problem:
        "Directories either invent people or turn peers into a leaderboard. Partners need discovery without scores.",
      solutionItems: [
        {
          kind: "screenshot",
          label: "Universe + List",
          description: "Constellations by mission; accessible list view.",
          href: "https://signal-atlas-omega.vercel.app",
        },
      ],
      proofOfWork: [
        {
          label: "Production",
          detail: "https://signal-atlas-omega.vercel.app",
          href: "https://signal-atlas-omega.vercel.app",
        },
        {
          label: "Public builder",
          detail: "https://signal-atlas-omega.vercel.app/builders/jiaxinaspenlin",
          href: "https://signal-atlas-omega.vercel.app/builders/jiaxinaspenlin",
        },
        {
          label: "Merged Project 3 PR",
          detail: "#202 in cohort monorepo",
        },
      ],
      liveAppUrl: "https://signal-atlas-omega.vercel.app",
      repoUrl: "https://github.com/jiaxinaspenlin-dotcom/signal-atlas",
      docsUrl:
        "https://github.com/jiaxinaspenlin-dotcom/signal-atlas/blob/main/docs/PARTNERS.md",
      status: "live",
    },
    activity: [
      {
        id: "al1",
        text: "New deployment — Signal Atlas production",
        when: "3 hours ago",
      },
      { id: "al2", text: "Merged Project 3 submission PR", when: "Yesterday" },
    ],
  }),
  makePerson({
    handle: "r3s0lv343vr",
    name: "Resolve",
    campus: "Summer Pilot",
    role: "Full-stack builder",
    initials: "RS",
    isDemo: false,
    headline:
      "NextMove — partner-facing vibe marketing with GitHub-linked profiles.",
    whyImHere:
      "I ship hiring surfaces partners will actually open — student/partner directories backed by a live production URL, not a pitch deck.",
    skills: ["Next.js", "Product", "Brand", "TypeScript"],
    links: {
      deployment: "https://nextmove-hult.vercel.app",
      portfolio: "https://nextmove-hult.vercel.app",
    },
    projects: [
      {
        label: "NextMove deploy",
        href: "https://nextmove-hult.vercel.app",
        kind: "deploy",
      },
      {
        label: "Build repo",
        href: "https://github.com/r3s0lv343vr/vibe-marketing-platform",
        kind: "repo",
      },
    ],
    buildLog: [
      { week: "Week 3", title: "Shipped vibe marketing platform (Project 3)" },
      { week: "Week 4", title: "Rebranded to NextMove — redirects preserved" },
    ],
    featuredProject: {
      title: "NextMove",
      tagline: "Cohort proof partners can browse and request intros from.",
      problem:
        "Mid-review rebrands break peer links. Partners need a stable HTTPS surface with real profile routes.",
      solutionItems: [
        {
          kind: "screenshot",
          label: "Profiles + partners",
          description: "GitHub-linked directory and partner path.",
          href: "https://nextmove-hult.vercel.app",
        },
      ],
      proofOfWork: [
        {
          label: "Production",
          detail: "https://nextmove-hult.vercel.app",
          href: "https://nextmove-hult.vercel.app",
        },
        {
          label: "Sample profile",
          detail: "https://nextmove-hult.vercel.app/profiles/r3s0lv343vr",
          href: "https://nextmove-hult.vercel.app/profiles/r3s0lv343vr",
        },
        {
          label: "Merged Project 3 update",
          detail: "#211 in cohort monorepo",
        },
      ],
      liveAppUrl: "https://nextmove-hult.vercel.app",
      repoUrl: "https://github.com/r3s0lv343vr/vibe-marketing-platform",
      docsUrl: "https://github.com/r3s0lv343vr/vibe-marketing-platform",
      status: "live",
    },
    activity: [
      { id: "rs1", text: "New deployment — NextMove production", when: "3 hours ago" },
      { id: "rs2", text: "Merged Project 3 update PR", when: "Yesterday" },
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
