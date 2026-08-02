import type { Builder } from "./types";
import { URLS } from "./config";

const SKILL_POOLS = [
  ["Next.js", "TypeScript", "Supabase", "Vercel"],
  ["React", "Node.js", "PostgreSQL", "Tailwind"],
  ["Firebase", "Realtime", "RLS", "Webhooks"],
  ["AI Agents", "Product", "System Design", "GitHub Actions"],
];

const TAGLINES = [
  "Shipping production systems at cohort velocity.",
  "Builder-first engineer with partner-ready demos.",
  "Turns ambiguous specs into deployed software.",
  "Full-stack operator across PM, comms, and showcase.",
];

function pick<T>(arr: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return arr[Math.abs(h) % arr.length]!;
}

function titleCase(handle: string): string {
  return handle
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function baseBuilder(handle: string, overrides?: Partial<Builder>): Builder {
  return {
    handle,
    displayName: titleCase(handle),
    tagline: pick(TAGLINES, handle),
    bio: `${titleCase(handle)} is an enrolled builder in the Hult Summer Pilot 2026 — shipping Phase 1 platforms in public with peer-reviewed PRs, live deploys, and production-grade integrations.`,
    skills: pick(SKILL_POOLS, handle),
    signatureProject: pick(
      ["Cohort PM Platform", "Internal Comms Hub", "Vibe Showcase", "Agent Harness"],
      handle + "sig"
    ),
    privacy: "public",
    campus: "Hult",
    deploys: {},
    ...overrides,
  };
}

/** Static roster — opt-in public profiles for enrolled cohort members. */
export const BUILDERS: Builder[] = [
  baseBuilder("solzco1", {
    displayName: "Solange Coker",
    tagline: "Hyper-focused builder shipping PM, comms, and showcase in one arc.",
    bio: "Solange leads Pulse — the cohort vibe marketing surface — while operating Sol PM and Sol Forth comms integrations against winning Forth + Cohort Comms platforms.",
    skills: ["Next.js", "Supabase", "Product", "Integrations"],
    signatureProject: "Pulse · Vibe Marketing Platform",
    deploys: {
      pm: URLS.solPm,
      comms: URLS.solComms,
      showcase: URLS.site,
    },
  }),
  baseBuilder("mitchelldante99-create", {
    signatureProject: "Themed PM + Comms Stack",
  }),
  baseBuilder("nikjain15", {
    displayName: "Nik Jain",
    signatureProject: "Rally · Motivation-Aware Comms",
    deploys: { comms: "https://rally-nikjain15.vercel.app" },
  }),
  baseBuilder("arjun-singh2127"),
  baseBuilder("codingwcal"),
  baseBuilder("divyaprakash04"),
  baseBuilder("gge513"),
  baseBuilder("godwinkamau"),
  baseBuilder("jiaxinaspenlin-dotcom"),
  baseBuilder("jj-javascript"),
  baseBuilder("joes9987"),
  baseBuilder("kiaracaesar5627"),
  baseBuilder("kperpignant"),
  baseBuilder("lorra-v", { signatureProject: "Amplify Showcase" }),
  baseBuilder("lvcasmadeit"),
  baseBuilder("r3s0lv343vr"),
  baseBuilder("ramyatolety"),
  baseBuilder("raven-dubgub"),
  baseBuilder("studmuffin01", {
    displayName: "Rawle Arneaud",
    signatureProject: "Lighthouse Showcase",
  }),
  baseBuilder("zukhriddingit", {
    signatureProject: "Relay 65 · Async Comms",
  }),
];

export function getBuilder(handle: string): Builder | undefined {
  return BUILDERS.find(
    (b) => b.handle.toLowerCase() === handle.toLowerCase()
  );
}

export function publicBuilders(): Builder[] {
  return BUILDERS.filter((b) => b.privacy === "public");
}
