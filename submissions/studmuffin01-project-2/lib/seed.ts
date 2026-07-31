import type { Channel, Member, Message, WorkspaceState } from "@/lib/types";
import { forthTicketUrl } from "@/lib/forth";

const CURRENT_USER_ID = "you";

const SEED_MEMBERS: Member[] = [
  {
    id: "you",
    name: "Rawle Arneaud",
    handle: "studmuffin01",
    role: "Builder",
    status: "online",
    initials: "RA",
  },
  {
    id: "maya",
    name: "Maya Chen",
    handle: "mayachen",
    role: "PM lead",
    status: "online",
    initials: "MC",
  },
  {
    id: "jordan",
    name: "Jordan Blake",
    handle: "jblake",
    role: "Engineer",
    status: "away",
    initials: "JB",
  },
  {
    id: "sofia",
    name: "Sofia Reyes",
    handle: "sreyes",
    role: "Designer",
    status: "online",
    initials: "SR",
  },
  {
    id: "noah",
    name: "Noah Patel",
    handle: "npatel",
    role: "Engineer",
    status: "offline",
    initials: "NP",
  },
];

const SEED_CHANNELS: Channel[] = [
  {
    id: "general",
    kind: "channel",
    name: "general",
    description: "Cohort chat — day-to-day collaboration outside ticket triage",
  },
  {
    id: "announcements",
    kind: "channel",
    name: "announcements",
    description: "Official program notices — keep noise low",
  },
  {
    id: "reviews",
    kind: "channel",
    name: "reviews",
    description: "Peer reviews, PR feedback, and “please try my deploy”",
  },
  {
    id: "motivation",
    kind: "channel",
    name: "motivation",
    description: "Encouragement and shout-outs while you ship Forth tickets",
  },
  {
    id: "at-risk",
    kind: "channel",
    name: "at-risk",
    description: "Campaigns or tickets that need attention in Forth",
    unread: 1,
  },
  {
    id: "help",
    kind: "channel",
    name: "help",
    description: "Unblock peers on builds, deploys, auth, and tooling",
    unread: 2,
  },
  {
    id: "dm-maya",
    kind: "dm",
    name: "Maya Chen",
    memberIds: ["you", "maya"],
  },
  {
    id: "dm-jordan",
    kind: "dm",
    name: "Jordan Blake",
    memberIds: ["you", "jordan"],
  },
];

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();

const SEED_MESSAGES: Message[] = [
  {
    id: "m1",
    channelId: "general",
    authorId: "maya",
    body: "Welcome to Fireside — the cohort circle next to Forth. Link tickets when chat becomes work.",
    createdAt: minutesAgo(180),
    reactions: [
      { emoji: "👋", count: 4 },
      { emoji: "🔥", count: 2 },
    ],
  },
  {
    id: "m2",
    channelId: "general",
    authorId: "sofia",
    body: "Landing + workspace shell are up. Drop tooling questions in #help; review asks in #reviews.",
    createdAt: minutesAgo(95),
    replyCount: 2,
  },
  {
    id: "m3",
    channelId: "general",
    authorId: "jordan",
    body: "Deploy checklist for Project 2: production URL, Forth integration notes, agent usage.",
    createdAt: minutesAgo(40),
    flags: ["important", "action"],
  },
  {
    id: "m4",
    channelId: "announcements",
    authorId: "maya",
    body: "Submission closes Wednesday 17:00 Eastern. Peer reviews open right after — written GitHub issue, then private vote.",
    createdAt: minutesAgo(300),
    flags: ["urgent", "important"],
  },
  {
    id: "m5",
    channelId: "help",
    authorId: "noah",
    body: "Anyone hitting auth redirect loops on Vercel? Happy to pair.",
    createdAt: minutesAgo(55),
    flags: ["unread", "action"],
  },
  {
    id: "m6",
    channelId: "help",
    authorId: "jordan",
    body: "Check Site URL + redirect allow list. Mismatch with the Vercel domain is the usual culprit.",
    createdAt: minutesAgo(48),
    flags: ["important"],
    taskLink: {
      initiativeTitle: "Internal Communications Platform",
      taskLabel: "Fix auth redirects",
      url: forthTicketUrl("internal-communications-platform", "auth-redirects"),
    },
  },
  {
    id: "m7",
    channelId: "reviews",
    authorId: "sofia",
    body: "PR is up for Fireside guest access — would love a pass on the sign-in → workspace flow.",
    createdAt: minutesAgo(35),
    flags: ["action"],
  },
  {
    id: "m8",
    channelId: "motivation",
    authorId: "maya",
    body: "Shout-out to everyone shipping Project 2 — keep linking done work back to Forth tickets.",
    createdAt: minutesAgo(50),
    reactions: [{ emoji: "🎉", count: 3 }],
  },
  {
    id: "m9",
    channelId: "at-risk",
    authorId: "jordan",
    body: "Internal Communications Platform tickets still open — auth redirects need an owner today.",
    createdAt: minutesAgo(25),
    flags: ["urgent", "action"],
    taskLink: {
      initiativeTitle: "Internal Communications Platform",
      taskLabel: "Fix auth redirects",
      url: forthTicketUrl("internal-communications-platform", "auth-redirects"),
    },
  },
  {
    id: "m10",
    channelId: "dm-maya",
    authorId: "maya",
    body: "Fireside + Forth is a clean pair — chat here, tickets there.",
    createdAt: minutesAgo(70),
  },
  {
    id: "m11",
    channelId: "dm-maya",
    authorId: "you",
    body: "Agreed. #reviews and #help should catch most of the cohort noise.",
    createdAt: minutesAgo(65),
  },
  {
    id: "m12",
    channelId: "dm-jordan",
    authorId: "jordan",
    body: "When you're ready, we can wire realtime so every enrolled participant sees the same room.",
    createdAt: minutesAgo(30),
  },
  {
    id: "t1",
    channelId: "general",
    authorId: "you",
    body: "Thread: I'll draft the README integration notes tonight.",
    createdAt: minutesAgo(90),
    threadParentId: "m2",
  },
  {
    id: "t2",
    channelId: "general",
    authorId: "sofia",
    body: "Perfect — I'll add a screenshot of the workspace shell.",
    createdAt: minutesAgo(85),
    threadParentId: "m2",
  },
];

export function createSeedWorkspace(): WorkspaceState {
  return {
    channels: SEED_CHANNELS,
    members: SEED_MEMBERS,
    messages: SEED_MESSAGES,
    currentUserId: CURRENT_USER_ID,
    activeChannelId: "general",
  };
}
