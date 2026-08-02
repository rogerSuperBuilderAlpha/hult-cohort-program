/**
 * Comentiq local seed — service role only.
 *
 * Usage (from project root):
 *   npm run seed
 *
 * Refuses to run unless NEXT_PUBLIC_SITE_URL is localhost
 * (override with SEED_ALLOW_REMOTE=1 — never use against production).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const SEED_EMAIL_DOMAIN = "seed.comentiq.demo";
const SEED_PASSWORD = "ComentiqSeed!26";
const COHORT_SLUG = "hult-summer-2026";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    throw new Error("Missing .env.local — copy from .env.example first.");
  }
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function assertLocalOnly() {
  if (process.env.SEED_ALLOW_REMOTE === "1") {
    console.warn("⚠ SEED_ALLOW_REMOTE=1 — skipping localhost guard.");
    return;
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const ok =
    site.includes("localhost") ||
    site.includes("127.0.0.1") ||
    site === "";
  if (!ok) {
    throw new Error(
      `Refusing to seed: NEXT_PUBLIC_SITE_URL="${site}" does not look local. Set SEED_ALLOW_REMOTE=1 only if you intentionally accept the risk.`,
    );
  }
}

function trackingCode(): string {
  return `cq-seed-${randomBytes(3).toString("hex")}`;
}

type SeedBuilder = {
  emailLocal: string;
  name: string;
  location: string;
  biography: string;
  skills: string[];
  interests: string[];
  sector: string;
  stage: "idea" | "building" | "launched" | "pilot" | "scaling";
  project: {
    name: string;
    slug: string;
    tagline: string;
    summary: string;
    description: string;
    problem: string;
    solution: string;
    target_audience: string;
    technology_stack: string[];
    needs: string[];
    featured?: boolean;
  };
  updates: {
    title: string;
    description: string;
    achievements: string[];
    challenges: string[];
    lessons: string[];
    next_steps: string[];
  }[];
  campaigns: {
    story_angle: string;
    why_angle_matters: string;
    audience: string[];
    core_message: string;
    evidence: string[];
    call_to_action: string;
    linkedin: string;
    x: string;
    instagram: string;
    partner_summary: string;
  }[];
};

const BUILDERS: SeedBuilder[] = [
  {
    emailLocal: "mira.vale",
    name: "Mira Vale",
    location: "Lisbon, PT",
    biography:
      "Former classroom facilitator building tools that help teachers see student progress without drowning in spreadsheets. Loves quiet UX and noisy feedback loops.",
    skills: ["Product design", "Edtech", "Facilitation", "Figma"],
    interests: ["Learning science", "Public schools", "Community"],
    sector: "Education",
    stage: "idea",
    project: {
      name: "PulseBoard Classroom",
      slug: "pulseboard-classroom",
      tagline: "A calm dashboard for spotting who’s stuck — before the week is over.",
      summary:
        "PulseBoard helps teachers turn weekly check-ins into a clear view of who needs support, without adding another grading burden.",
      description:
        "Teachers collect a 60-second pulse from students; the board clusters themes and flags quiet students who may need a follow-up conversation.",
      problem:
        "Teachers often learn a student is struggling only after grades drop — too late for a small intervention.",
      solution:
        "Lightweight pulse prompts plus a visual board that highlights patterns without ranking students publicly.",
      target_audience: "Secondary school teachers and instructional coaches",
      technology_stack: ["Next.js", "Supabase", "TypeScript"],
      needs: ["Pilot organization", "Early users", "Industry mentor"],
      featured: true,
    },
    updates: [
      {
        title: "First teacher interviews completed",
        description:
          "Spoke with six teachers about how they currently track soft signals of struggle. Spreadsheets and sticky notes still rule.",
        achievements: [
          "6 interviews scheduled and completed",
          "Mapped the weekly ritual most teachers already use",
        ],
        challenges: ["Finding time between term assessments"],
        lessons: ["Teachers want fewer tools, not smarter ones that stack"],
        next_steps: ["Prototype the pulse prompt flow", "Recruit two pilot classrooms"],
      },
      {
        title: "Paper prototype tested in a planning meeting",
        description:
          "Ran a paper board with sticky notes representing student pulses. Coaches immediately asked for a ‘quiet but capable’ filter.",
        achievements: ["Validated the cluster metaphor", "Named three priority filters"],
        challenges: ["Avoiding anything that feels like public ranking"],
        lessons: ["Privacy framing must lead every demo"],
        next_steps: ["Build the filter chips", "Draft privacy copy for parents"],
      },
      {
        title: "Landing narrative for partner schools",
        description:
          "Wrote a one-pager for school leaders focused on early support, not surveillance.",
        achievements: ["Partner one-pager drafted", "Two schools interested in a spring pilot"],
        challenges: ["Procurement timelines are slow"],
        lessons: ["Lead with teacher time saved"],
        next_steps: ["Schedule follow-up with North Harbor Academy (fictional partner)"],
      },
    ],
    campaigns: [
      {
        story_angle: "Catch the quiet struggle before the grade drops",
        why_angle_matters:
          "Most edtech celebrates scores. Mira’s story is about noticing students who go quiet — with evidence from real teacher interviews.",
        audience: ["Teachers", "Instructional coaches", "School partners"],
        core_message:
          "PulseBoard turns a 60-second classroom pulse into early support, not another ranking board.",
        evidence: [
          "Six teacher interviews completed",
          "Paper prototype validated cluster filters",
          "Two fictional partner schools exploring a spring pilot",
        ],
        call_to_action: "Pilot PulseBoard with your teaching team this term",
        linkedin:
          "Teachers rarely need another dashboard. They need a calmer way to notice who’s stuck.\n\nAfter six interviews, a clear pattern: sticky notes and spreadsheets still carry the soft signals.\n\nPulseBoard is my Hult Summer Cohort project — a lightweight pulse + board that flags quiet students without public ranking.\n\nLooking for pilot classrooms. Happy to walk through the paper prototype.",
        x: "Building PulseBoard in the Hult Summer Cohort: a 60-second student pulse that helps teachers spot quiet struggle early — not another grade leaderboard.\n\nPaper prototype done. Pilot classrooms wanted.",
        instagram:
          "Quiet ≠ fine.\n\nPulseBoard helps teachers see soft signals before grades drop. Built in the Hult Summer Cohort.\n\nPaper board → digital filters next. Pilot teachers: say hi.",
        partner_summary:
          "PulseBoard is an early-stage classroom tool that turns brief student check-ins into a private support board for teachers. Evidence so far: six teacher interviews and a validated paper prototype. Seeking pilot schools and instructional coaches for a spring trial.",
      },
    ],
  },
  {
    emailLocal: "jonas.reed",
    name: "Jonas Reed",
    location: "Nairobi, KE",
    biography:
      "Climate data tinkerer translating messy field readings into neighborhood-scale heat stories. Background in GIS and community workshops.",
    skills: ["GIS", "Python", "Community workshops", "Data viz"],
    interests: ["Urban heat", "Open data", "Mutual aid"],
    sector: "Climate",
    stage: "building",
    project: {
      name: "ShadeMap Collective",
      slug: "shademap-collective",
      tagline: "Neighborhood heat maps built with residents, not about them.",
      summary:
        "ShadeMap helps community groups map shade gaps and heat risk using field readings plus resident notes — then prioritize tree and canopy asks.",
      description:
        "A mobile-friendly map where volunteers log shade, surface heat, and stories. Aggregates into a shareable brief for local councils.",
      problem:
        "Heat risk maps often ignore lived experience and undercount informal shade assets residents already use.",
      solution:
        "Combine low-cost sensors with resident annotations to produce actionable shade priority maps.",
      target_audience: "Neighborhood associations and municipal climate offices",
      technology_stack: ["MapLibre", "Python", "Supabase"],
      needs: ["Data partner", "Pilot organization", "Sponsor"],
      featured: true,
    },
    updates: [
      {
        title: "First field walk with 12 volunteers",
        description:
          "Logged shade coverage across three blocks near a busy market. Residents marked informal gathering spots that satellite data misses.",
        achievements: ["12 volunteers trained", "214 shade points logged"],
        challenges: ["Phone batteries died midday"],
        lessons: ["Bring paper backup sheets"],
        next_steps: ["Clean the dataset", "Draft the first council brief"],
      },
      {
        title: "Prototype map live for internal testing",
        description:
          "Uploaded cleaned points to a MapLibre prototype. Added filters for time of day and surface type.",
        achievements: ["Internal map URL shared with volunteers", "Time-of-day filter shipped"],
        challenges: ["Conflicting GPS accuracy on older phones"],
        lessons: ["Accept approximate pins with confidence tags"],
        next_steps: ["Pilot with a second neighborhood group"],
      },
    ],
    campaigns: [
      {
        story_angle: "Heat maps that start on foot, not from orbit",
        why_angle_matters:
          "Jonas’s updates show resident-logged shade points that satellite layers miss — a credible climate story grounded in field work.",
        audience: ["Municipal partners", "Climate funders", "Community groups"],
        core_message:
          "ShadeMap Collective turns neighborhood walks into canopy priority briefs councils can act on.",
        evidence: [
          "214 shade points logged with 12 volunteers",
          "Internal MapLibre prototype live",
          "Time-of-day filters shipped",
        ],
        call_to_action: "Partner on the next neighborhood walk or sponsor sensors",
        linkedin:
          "Satellites don’t see the mango tree people actually stand under at noon.\n\nWith 12 volunteers we logged 214 shade points across three market blocks — and built a MapLibre prototype for ShadeMap Collective (Hult Summer Cohort).\n\nLooking for data partners and municipal collaborators who want resident-grounded heat stories.",
        x: "ShadeMap Collective update: 214 resident-logged shade points → MapLibre prototype. Built in the Hult Summer Cohort. Partners who care about urban heat: let’s talk.",
        instagram:
          "Walk first. Map second.\n\nShadeMap Collective — neighborhood heat stories from the Hult Summer Cohort.\n\n214 points. 12 volunteers. Prototype live.",
        partner_summary:
          "ShadeMap Collective is a building-stage climate tool for community shade mapping. Field evidence includes 214 logged points and a live internal map prototype. Seeking data partners, municipal pilots, and sensor sponsorship.",
      },
      {
        story_angle: "From sticky heat to a council-ready brief",
        why_angle_matters:
          "The second campaign focuses on the output partners care about: a shareable brief, not just points on a map.",
        audience: ["City climate offices", "Sponsors"],
        core_message:
          "ShadeMap turns volunteer walks into prioritized canopy asks your office can review.",
        evidence: [
          "Volunteer walk completed",
          "Prototype filters for surface type",
          "Brief template drafted",
        ],
        call_to_action: "Request a sample shade priority brief",
        linkedin:
          "What would your climate office do with a shade priority brief built by residents?\n\nShadeMap Collective (Hult Summer Cohort) just finished its first neighborhood walk and shipped time-of-day filters on an internal map.\n\nHappy to share a sample brief format.",
        x: "Working on council-ready shade briefs from resident walks — ShadeMap Collective / Hult Summer Cohort. Sample brief format available.",
        instagram:
          "Heat is uneven. So is shade.\n\nWe’re drafting brief formats municipalities can actually use. ShadeMap Collective.",
        partner_summary:
          "Second campaign angle for ShadeMap: converting field walks into municipal briefs. Prototype filters exist; seeking offices willing to review a sample brief.",
      },
    ],
  },
  {
    emailLocal: "priya.north",
    name: "Priya North",
    location: "Toronto, CA",
    biography:
      "Clinical ops nerd designing clearer post-visit instructions for patients who leave appointments confused. Obsessed with plain language.",
    skills: ["Healthcare ops", "UX writing", "Research", "React"],
    interests: ["Patient literacy", "Care pathways", "Accessibility"],
    sector: "Healthcare",
    stage: "launched",
    project: {
      name: "AfterVisit Clear",
      slug: "aftervisit-clear",
      tagline: "Plain-language after-visit summaries patients can actually follow.",
      summary:
        "AfterVisit Clear helps clinics turn dense discharge notes into stepwise instructions with medication timing and red-flag reminders.",
      description:
        "Clinicians paste or dictate notes; the tool produces a patient-facing card in plain language, reviewed before send.",
      problem:
        "Patients leave visits unsure what to do next, driving avoidable follow-up calls and anxiety.",
      solution:
        "A clinician-in-the-loop plain-language summary with checklists and red-flag cues.",
      target_audience: "Outpatient clinics and care coordinators",
      technology_stack: ["Next.js", "Anthropic", "Postgres"],
      needs: ["Pilot organization", "Research partner", "Early users"],
    },
    updates: [
      {
        title: "Soft launch with one clinic pod",
        description:
          "Three clinicians used AfterVisit Clear for two weeks on non-urgent visits. Average edit time after generation: under four minutes.",
        achievements: ["Soft launch live", "42 summaries generated", "Clinician edit time measured"],
        challenges: ["Specialty templates still thin"],
        lessons: ["Human review is non-negotiable"],
        next_steps: ["Add cardiology template", "Collect patient comprehension feedback"],
      },
      {
        title: "Patient comprehension spot checks",
        description:
          "Phone follow-ups with 15 patients. Most could restate next steps; medication timing still needs clearer icons.",
        achievements: ["15 patient spot checks", "Iconography backlog prioritized"],
        challenges: ["Scheduling calls across time zones"],
        lessons: ["Visual timing beats paragraphs"],
        next_steps: ["Ship timing icons", "Write research brief"],
      },
      {
        title: "Clinic ops asked for bilingual cards",
        description:
          "The pilot pod requested Spanish alongside English for the next sprint — now scoped.",
        achievements: ["Bilingual scope approved by clinic lead"],
        challenges: ["Translation QA capacity"],
        lessons: ["Partner early with bilingual staff"],
        next_steps: ["Draft Spanish template", "Find review partners"],
      },
    ],
    campaigns: [
      {
        story_angle: "Leave the clinic knowing the next three steps",
        why_angle_matters:
          "Priya has launch evidence: 42 summaries and patient spot checks — stronger than a pure idea story.",
        audience: ["Clinic operators", "Care coordinators", "Research partners"],
        core_message:
          "AfterVisit Clear turns dense notes into plain-language next steps — with clinicians still in control.",
        evidence: [
          "Soft launch with one clinic pod",
          "42 summaries generated",
          "15 patient comprehension spot checks",
        ],
        call_to_action: "Pilot AfterVisit Clear with your outpatient pod",
        linkedin:
          "Patients shouldn’t need a medical degree to leave an appointment.\n\nAfterVisit Clear soft-launched with one clinic pod: 42 clinician-reviewed summaries, then 15 patient spot checks on comprehension.\n\nBuilt in the Hult Summer Cohort. Looking for outpatient pilots and research partners who care about plain language.",
        x: "AfterVisit Clear is live with a clinic pod: 42 clinician-reviewed summaries + patient spot checks. Hult Summer Cohort. Pilots welcome.",
        instagram:
          "Dense notes → clear next steps.\n\nAfterVisit Clear soft launch metrics are in. Clinicians stay in the loop. Always.",
        partner_summary:
          "AfterVisit Clear is a launched clinic tool for plain-language after-visit cards. Soft-launch evidence: 42 summaries and 15 patient spot checks. Seeking additional outpatient pilots and research collaborators.",
      },
    ],
  },
  {
    emailLocal: "leo.santo",
    name: "Leo Santo",
    location: "Mexico City, MX",
    biography:
      "Creative technologist helping independent studios show process, not just polished reels. Background in motion design and community programs.",
    skills: ["Motion design", "Creative coding", "Community", "Next.js"],
    interests: ["Independent studios", "Process sharing", "Culture"],
    sector: "Creative Industries",
    stage: "pilot",
    project: {
      name: "StudioTrail",
      slug: "studiotrail",
      tagline: "A public trail of studio process — sketches, failed takes, and shipped work.",
      summary:
        "StudioTrail lets small creative studios publish process trails that partners and clients can follow without drowning in Drive folders.",
      description:
        "Studios post milestones with media; visitors follow a chronological trail that contextualizes the final piece.",
      problem:
        "Creative work looks magical from the outside, which makes collaboration and funding harder for independent studios.",
      solution:
        "A lightweight public trail that shows process with intentional privacy controls.",
      target_audience: "Independent design and animation studios",
      technology_stack: ["Next.js", "Cloudinary", "Supabase"],
      needs: ["Early users", "Media coverage", "Sponsor"],
    },
    updates: [
      {
        title: "Pilot with two fictional studios",
        description:
          "Northline Motion and Paperkite Atelier (both fictional) published first trails. Feedback: need private draft mode before publish.",
        achievements: ["2 pilot studios onboarded", "Draft mode requested and scoped"],
        challenges: ["Large video uploads"],
        lessons: ["Process posts should default private"],
        next_steps: ["Ship draft mode", "Improve upload retries"],
      },
      {
        title: "Draft mode shipped to pilots",
        description:
          "Studios can now stage trails privately. First private-to-public publish happened this week.",
        achievements: ["Draft mode live", "First private→public publish"],
        challenges: ["Permission UI confused one pilot"],
        lessons: ["Rename ‘unlisted’ to ‘studio only’"],
        next_steps: ["Copy pass on permissions", "Invite a third studio"],
      },
    ],
    campaigns: [
      {
        story_angle: "Show the messy middle of creative work",
        why_angle_matters:
          "Leo’s pilot studios prove StudioTrail is in use — process sharing with privacy, not empty portfolio theater.",
        audience: ["Studios", "Creative sponsors", "Media"],
        core_message:
          "StudioTrail helps independent studios publish process trails clients and partners can actually follow.",
        evidence: [
          "Two fictional pilot studios onboarded",
          "Draft mode shipped",
          "First private-to-public publish completed",
        ],
        call_to_action: "Join the StudioTrail pilot as a studio or sponsor",
        linkedin:
          "Polished reels hide the real work.\n\nStudioTrail is in pilot with two independent studios (Hult Summer Cohort). Draft mode just shipped so process can stay private until it’s ready.\n\nLooking for more studios — and sponsors who fund process, not just finals.",
        x: "StudioTrail pilot update: draft mode live, first private→public trail published. Independent studios welcome. Hult Summer Cohort.",
        instagram:
          "Sketches. Failed takes. Then the piece.\n\nStudioTrail makes the middle visible — on purpose.\n\nPiloting now.",
        partner_summary:
          "StudioTrail is a pilot-stage platform for creative process trails. Two studios are live; draft mode shipped. Seeking additional studios and creative sponsors.",
      },
    ],
  },
  {
    emailLocal: "hana.okoye",
    name: "Hana Okoye",
    location: "Berlin, DE",
    biography:
      "Productivity systems designer focused on deep work for small teams who refuse bloated project tools. Ex-ops lead at a cooperative studio.",
    skills: ["Ops design", "Facilitation", "TypeScript", "Systems thinking"],
    interests: ["Deep work", "Small teams", "Coops"],
    sector: "Productivity",
    stage: "scaling",
    project: {
      name: "FocusLane",
      slug: "focuslane",
      tagline: "One lane of work per day — for teams that overcommit by noon.",
      summary:
        "FocusLane helps small teams pick a single daily commitment lane, surface blockers early, and end the day with a honest close-out.",
      description:
        "Morning lane selection, midday blocker ping, end-of-day close. Integrations stay optional on purpose.",
      problem:
        "Small teams drown in multi-tool task lists and lose the plot by afternoon.",
      solution:
        "A constrained daily lane ritual that prioritizes focus over feature sprawl.",
      target_audience: "Teams of 3–12 in product and creative ops",
      technology_stack: ["Next.js", "Postgres", "Resend"],
      needs: ["Early users", "Distribution partner", "Industry mentor"],
    },
    updates: [
      {
        title: "Crossed 40 weekly active teams (fictional metric)",
        description:
          "FocusLane’s cohort pilot network hit forty fictional weekly-active teams. Retention on the close-out ritual is the sticky part.",
        achievements: ["40 WAU teams (seed fiction)", "Close-out ritual retention strong"],
        challenges: ["Onboarding still too text-heavy"],
        lessons: ["Teach the ritual before the settings"],
        next_steps: ["Rewrite onboarding", "Add team invite templates"],
      },
      {
        title: "Partner distribution experiment",
        description:
          "Ran a co-branded intro with a fictional coworking network. Conversion better when framed as a ritual, not a tool.",
        achievements: ["Co-branded intro ran", "Ritual framing outperformed tool framing"],
        challenges: ["Support load spiked briefly"],
        lessons: ["Partner pages need clearer expectations"],
        next_steps: ["Create partner one-pager", "Hire part-time support (aspirational)"],
      },
      {
        title: "Scaling checklist for the next 90 days",
        description:
          "Documented what must stay simple as invites grow — no kanban creep.",
        achievements: ["90-day simplicity checklist published internally"],
        challenges: ["Feature requests from power users"],
        lessons: ["Say no in public"],
        next_steps: ["Ship invite templates", "Keep scope board visible"],
      },
    ],
    campaigns: [
      {
        story_angle: "One honest lane beats twelve forgotten tasks",
        why_angle_matters:
          "Hana’s scaling-stage story uses clear (fictional) usage signals and a distribution lesson partners can understand.",
        audience: ["Small teams", "Coworking partners", "Mentors"],
        core_message:
          "FocusLane is a daily commitment ritual for teams who overcommit by noon — intentionally small.",
        evidence: [
          "40 weekly-active teams in the pilot network (fictional)",
          "Close-out ritual driving retention",
          "Co-branded partner intro outperformed tool-framed messaging",
        ],
        call_to_action: "Try FocusLane with your team or distribute it to yours",
        linkedin:
          "Most productivity tools ask teams to manage more.\n\nFocusLane asks for one lane a day — then a honest close-out.\n\nIn our Hult Summer Cohort pilot network we’re seeing retention cluster around that close-out ritual (and a coworking distribution test worked better when we sold the ritual, not the software).\n\nLooking for early teams and distribution partners.",
        x: "FocusLane update: daily lane + close-out ritual is what sticks. Scaling carefully in the Hult Summer Cohort. Teams of 3–12: come try.",
        instagram:
          "Twelve tasks by noon is not ambition. It’s fog.\n\nFocusLane — one lane. Built in the Hult Summer Cohort.",
        partner_summary:
          "FocusLane is a scaling-stage productivity ritual for small teams. Pilot network shows strong close-out retention; seeking distribution partners and mentors who value constraint.",
      },
    ],
  },
  {
    emailLocal: "samir.bloom",
    name: "Samir Bloom",
    location: "Austin, US",
    biography:
      "AI tooling builder helping researchers keep citations attached to generated drafts. Skeptical of hype; serious about provenance.",
    skills: ["LLM apps", "Evaluation", "Python", "Product"],
    interests: ["Research workflows", "Provenance", "Open science"],
    sector: "AI",
    stage: "building",
    project: {
      name: "CiteKeep Drafts",
      slug: "citekeep-drafts",
      tagline: "Generated drafts that refuse to lose their sources.",
      summary:
        "CiteKeep Drafts helps researchers draft with AI while keeping citation anchors visible, reviewable, and exportable.",
      description:
        "Paste sources, generate section drafts, and review each claim against its citation card before export.",
      problem:
        "AI drafting tools make it too easy to lose the link between a claim and its source.",
      solution:
        "Claim-level citation cards with forced review before export.",
      target_audience: "Graduate researchers and research assistants",
      technology_stack: ["Python", "Next.js", "Postgres", "Anthropic"],
      needs: ["Research partner", "Early users", "Technical collaborator"],
    },
    updates: [
      {
        title: "Claim-card review UI in testing",
        description:
          "Built the review pane where each claim shows its citation card. Five research assistants tried it on literature reviews.",
        achievements: ["Claim-card UI in test", "5 RA testers onboarded"],
        challenges: ["Long PDF parsing still brittle"],
        lessons: ["Start with user-provided excerpts"],
        next_steps: ["Improve excerpt import", "Add export to markdown"],
      },
      {
        title: "Markdown export with anchors",
        description:
          "Shipped markdown export that keeps citation anchors. Testers asked for Zotero-friendly keys next.",
        achievements: ["Markdown export shipped", "Zotero key request logged"],
        challenges: ["Key mapping edge cases"],
        lessons: ["Don’t invent citation keys silently"],
        next_steps: ["Zotero mapping spike", "Recruit two more labs (fictional)"],
      },
    ],
    campaigns: [
      {
        story_angle: "AI drafts that keep their receipts",
        why_angle_matters:
          "Samir’s story is credibility in an AI-hype week: citation cards and RA testing, not vanity demos.",
        audience: ["Researchers", "Labs", "Technical collaborators"],
        core_message:
          "CiteKeep Drafts forces claim-level citation review before anything exports.",
        evidence: [
          "Claim-card review UI in testing",
          "Five research assistants testing literature reviews",
          "Markdown export with anchors shipped",
        ],
        call_to_action: "Join the CiteKeep research pilot",
        linkedin:
          "If your AI draft can’t show its sources, it isn’t ready to leave the sandbox.\n\nCiteKeep Drafts (Hult Summer Cohort) puts a citation card on every claim — five research assistants are testing it on lit reviews, and markdown export with anchors just shipped.\n\nLooking for research partners and collaborators who care about provenance.",
        x: "CiteKeep Drafts: claim-level citation cards + markdown export. RA testing underway. Hult Summer Cohort. Research partners welcome.",
        instagram:
          "Every claim. A citation card.\n\nCiteKeep Drafts — provenance over vibes.\n\nBuilt in the Hult Summer Cohort.",
        partner_summary:
          "CiteKeep Drafts is a building-stage AI research tool focused on citation provenance. Evidence: claim-card UI in testing with five RAs; markdown export shipped. Seeking research partners and technical collaborators.",
      },
    ],
  },
];

/** Who amplifies whom (by emailLocal): amplifier → target */
const AMPLIFICATIONS: { from: string; to: string; content: string }[] = [
  {
    from: "jonas.reed",
    to: "mira.vale",
    content:
      "Building ShadeMap beside Mira’s PulseBoard work in the Hult Summer Cohort has been a good reminder that ‘quiet signals’ matter in classrooms and on hot streets. Her teacher interviews make the product feel grounded — cheering her pilot classroom search.",
  },
  {
    from: "priya.north",
    to: "mira.vale",
    content:
      "As someone wrestling with plain language in clinics, I’m impressed by Mira’s insistence that PulseBoard never becomes a public ranking board. Solid cohort neighbor energy — hope the spring pilots land.",
  },
  {
    from: "leo.santo",
    to: "jonas.reed",
    content:
      "Jonas’s ShadeMap walks are the kind of process I wish more climate tools showed. Watching him log shade with residents while I pilot StudioTrail — different domains, same honesty. Boosting this.",
  },
  {
    from: "hana.okoye",
    to: "priya.north",
    content:
      "Priya’s AfterVisit Clear soft launch numbers are the sort of evidence FocusLane also chases: small, measured, human-reviewed. Glad we’re building in the same cohort.",
  },
  {
    from: "samir.bloom",
    to: "hana.okoye",
    content:
      "Hana’s restraint on FocusLane scope is refreshing in a tooling-heavy cohort week. One lane a day is a product opinion — and the close-out ritual story lands. Rooting for the distribution partners.",
  },
  {
    from: "mira.vale",
    to: "samir.bloom",
    content:
      "CiteKeep’s claim cards are the AI story I want more of — provenance first. From one cohort builder to another: the RA testing update made me trust the trajectory.",
  },
];

async function deleteExistingSeedUsers(admin: SupabaseClient) {
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 100,
    });
    if (error) throw error;
    const users = data.users ?? [];
    const seeds = users.filter((u) =>
      (u.email || "").endsWith(`@${SEED_EMAIL_DOMAIN}`),
    );
    for (const user of seeds) {
      const { error: delError } = await admin.auth.admin.deleteUser(user.id);
      if (delError) {
        console.warn(`Could not delete ${user.email}: ${delError.message}`);
      } else {
        console.log(`Removed previous seed user ${user.email}`);
      }
    }
    if (users.length < 100) break;
    page += 1;
  }
}

async function main() {
  loadEnvLocal();
  assertLocalOnly();

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("Seeding Comentiq demo data (local)…");
  await deleteExistingSeedUsers(admin);

  const { data: cohort, error: cohortError } = await admin
    .from("cohorts")
    .select("id, name")
    .eq("slug", COHORT_SLUG)
    .maybeSingle();
  if (cohortError || !cohort) {
    throw new Error(
      `Cohort ${COHORT_SLUG} missing. Run 001_schema.sql in the SQL Editor first.`,
    );
  }

  const byLocal = new Map<
    string,
    {
      userId: string;
      projectId: string;
      projectSlug: string;
      campaignIds: string[];
      name: string;
      projectName: string;
    }
  >();

  for (const builder of BUILDERS) {
    const email = `${builder.emailLocal}@${SEED_EMAIL_DOMAIN}`;
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password: SEED_PASSWORD,
        email_confirm: true,
        user_metadata: { name: builder.name },
      });
    if (createError || !created.user) {
      throw new Error(
        `Failed to create ${email}: ${createError?.message ?? "unknown"}`,
      );
    }
    const userId = created.user.id;

    const { error: profileError } = await admin.from("profiles").upsert({
      id: userId,
      email,
      name: builder.name,
      role: "participant",
      biography: builder.biography,
      location: builder.location,
      skills: builder.skills,
      interests: builder.interests,
      social_links: {
        linkedin: `https://linkedin.com/in/${builder.emailLocal}-demo`,
        x: `https://x.com/${builder.emailLocal}_demo`,
      },
      website_url: `https://example.com/${builder.emailLocal}`,
      github_profile_url: `https://github.com/${builder.emailLocal}-demo`,
      profile_status: "published",
      visible_to_partners: true,
      updated_at: new Date().toISOString(),
    });
    if (profileError) {
      throw new Error(`Profile ${email}: ${profileError.message}`);
    }

    const { data: project, error: projectError } = await admin
      .from("projects")
      .insert({
        cohort_id: cohort.id,
        owner_id: userId,
        name: builder.project.name,
        slug: builder.project.slug,
        tagline: builder.project.tagline,
        summary: builder.project.summary,
        description: builder.project.description,
        problem: builder.project.problem,
        solution: builder.project.solution,
        target_audience: builder.project.target_audience,
        technology_stack: builder.project.technology_stack,
        stage: builder.stage,
        needs: builder.project.needs,
        sectors: [builder.sector],
        status: "published",
        featured: Boolean(builder.project.featured),
        live_url: `https://example.com/apps/${builder.project.slug}`,
        github_url: `https://github.com/comentiq-demo/${builder.project.slug}`,
      })
      .select("id")
      .single();
    if (projectError || !project) {
      throw new Error(
        `Project ${builder.project.slug}: ${projectError?.message}`,
      );
    }

    const updateIds: string[] = [];
    for (const update of builder.updates) {
      const { data: updateRow, error: updateError } = await admin
        .from("project_updates")
        .insert({
          project_id: project.id,
          title: update.title,
          description: update.description,
          achievements: update.achievements,
          challenges: update.challenges,
          lessons: update.lessons,
          next_steps: update.next_steps,
          evidence_links: [`https://example.com/evidence/${builder.project.slug}`],
        })
        .select("id")
        .single();
      if (updateError || !updateRow) {
        throw new Error(`Update for ${builder.name}: ${updateError?.message}`);
      }
      updateIds.push(updateRow.id);
    }

    const campaignIds: string[] = [];
    for (const [index, campaign] of builder.campaigns.entries()) {
      const { data: campaignRow, error: campaignError } = await admin
        .from("campaigns")
        .insert({
          cohort_id: cohort.id,
          project_id: project.id,
          project_update_id: updateIds[Math.min(index, updateIds.length - 1)] ?? null,
          creator_id: userId,
          name: `${builder.project.name} — ${campaign.story_angle.slice(0, 48)}`,
          story_angle: campaign.story_angle,
          why_angle_matters: campaign.why_angle_matters,
          audience: campaign.audience,
          core_message: campaign.core_message,
          evidence: campaign.evidence,
          call_to_action: campaign.call_to_action,
          status: "approved",
          tracking_code: trackingCode(),
        })
        .select("id")
        .single();
      if (campaignError || !campaignRow) {
        throw new Error(
          `Campaign for ${builder.name}: ${campaignError?.message}`,
        );
      }
      campaignIds.push(campaignRow.id);

      const contents = [
        { channel: "linkedin", content: campaign.linkedin },
        { channel: "x", content: campaign.x },
        { channel: "instagram", content: campaign.instagram },
        { channel: "partner_summary", content: campaign.partner_summary },
      ] as const;

      const { error: contentError } = await admin.from("campaign_content").insert(
        contents.map((row) => ({
          campaign_id: campaignRow.id,
          channel: row.channel,
          content: row.content,
          status: "approved",
          approved_by: userId,
          approved_at: new Date().toISOString(),
        })),
      );
      if (contentError) {
        throw new Error(
          `Campaign content for ${builder.name}: ${contentError.message}`,
        );
      }
    }

    byLocal.set(builder.emailLocal, {
      userId,
      projectId: project.id,
      projectSlug: builder.project.slug,
      campaignIds,
      name: builder.name,
      projectName: builder.project.name,
    });
    console.log(`✓ ${builder.name} — ${builder.project.name} (${builder.stage})`);
  }

  for (const amp of AMPLIFICATIONS) {
    const from = byLocal.get(amp.from);
    const to = byLocal.get(amp.to);
    if (!from || !to || !to.campaignIds[0]) {
      throw new Error(`Amplification mapping failed: ${amp.from} → ${amp.to}`);
    }
    const { error } = await admin.from("amplifications").insert({
      campaign_id: to.campaignIds[0],
      participant_id: from.userId,
      content: amp.content,
      status: "shared",
      shared_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Amplification: ${error.message}`);
  }
  console.log(`✓ ${AMPLIFICATIONS.length} shared amplifications`);

  const mira = byLocal.get("mira.vale")!;
  const jonas = byLocal.get("jonas.reed")!;
  const priya = byLocal.get("priya.north")!;

  const enquiries = [
    {
      organization: "Harborline Learning Co-op",
      contact_name: "Tess Quill",
      email: "tess.quill@harborline-coop.example",
      interest_type: "Pilot organization",
      project_id: mira.projectId,
      participant_id: mira.userId,
      website_url: "https://harborline-coop.example",
      linkedin_url: "https://linkedin.com/company/harborline-coop-demo",
      message:
        "We run a fictional teacher network and would like to explore a spring PulseBoard pilot.",
      status: "new" as const,
    },
    {
      organization: "Cedar Municipal Climate Desk",
      contact_name: "Owen Bramble",
      email: "owen.bramble@cedar-climate.example",
      interest_type: "Data partner",
      project_id: jonas.projectId,
      participant_id: jonas.userId,
      website_url: "https://cedar-climate.example",
      linkedin_url: null,
      message:
        "Interested in reviewing a sample shade priority brief for a fictional district office.",
      status: "in_progress" as const,
    },
    {
      organization: "Northriver Outpatient Group",
      contact_name: "Dr. Lila Moss",
      email: "lila.moss@northriver-outpatient.example",
      interest_type: "Research partner",
      project_id: priya.projectId,
      participant_id: priya.userId,
      website_url: null,
      linkedin_url: "https://linkedin.com/in/lila-moss-demo",
      message:
        "Closed after an intro call — keeping on file for a later bilingual card study.",
      status: "closed" as const,
    },
  ];

  for (const enquiry of enquiries) {
    const { error } = await admin.from("partner_enquiries").insert({
      cohort_id: cohort.id,
      ...enquiry,
    });
    if (error) {
      // Retry without link columns if migration 003 not applied yet
      if (error.message.includes("website_url") || error.message.includes("linkedin_url")) {
        const { website_url: _w, linkedin_url: _l, ...rest } = enquiry;
        const { error: retryError } = await admin
          .from("partner_enquiries")
          .insert({ cohort_id: cohort.id, ...rest });
        if (retryError) throw new Error(`Enquiry: ${retryError.message}`);
        console.warn(
          "⚠ partner enquiry inserted without link columns — run 003_partner_enquiry_links.sql",
        );
      } else {
        throw new Error(`Enquiry: ${error.message}`);
      }
    }
  }
  console.log("✓ 3 partner enquiries (new / in_progress / closed)");

  const analyticsRows = [];
  for (const builder of byLocal.values()) {
    analyticsRows.push(
      {
        cohort_id: cohort.id,
        project_id: builder.projectId,
        campaign_id: null,
        event_type: "project_view",
        source: "seed",
        metadata: { seed: true, slug: builder.projectSlug },
      },
      {
        cohort_id: cohort.id,
        project_id: builder.projectId,
        campaign_id: builder.campaignIds[0] ?? null,
        event_type: "campaign_view",
        source: "seed",
        metadata: { seed: true },
      },
    );
  }
  for (const amp of AMPLIFICATIONS) {
    const to = byLocal.get(amp.to)!;
    analyticsRows.push({
      cohort_id: cohort.id,
      project_id: to.projectId,
      campaign_id: to.campaignIds[0] ?? null,
      event_type: "amplification_action",
      source: "seed",
      metadata: { seed: true, from: amp.from },
    });
  }
  analyticsRows.push({
    cohort_id: cohort.id,
    project_id: mira.projectId,
    campaign_id: null,
    event_type: "partner_enquiry_submitted",
    source: "seed",
    metadata: { seed: true, organization: "Harborline Learning Co-op" },
  });

  const { error: analyticsError } = await admin
    .from("analytics_events")
    .insert(analyticsRows);
  if (analyticsError) {
    throw new Error(`Analytics: ${analyticsError.message}`);
  }
  console.log(`✓ ${analyticsRows.length} analytics events`);

  console.log("\n—— Seed complete ——");
  console.log(`Cohort: ${cohort.name}`);
  console.log(`Password for all seed users: ${SEED_PASSWORD}`);
  console.log("Builders / projects:");
  for (const builder of BUILDERS) {
    console.log(
      `  • ${builder.name} <${builder.emailLocal}@${SEED_EMAIL_DOMAIN}> — ${builder.project.name} [${builder.stage}]`,
    );
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
