/**
 * Rally's on-Home assistant — shared, dependency-free definitions so the tool set and the
 * safe/propose split are unit-testable without a live model or Firestore.
 *
 * The invariant (same spine as every other intelligence): the model has NO authority. It can
 * READ things the caller could already read, and it can DRAFT actions — but every action that
 * writes points, posts as the user, or credits a peer is a PROPOSAL the user confirms in the UI.
 * The model never awards, never posts, never confirms a recognition. In the UI it is only ever
 * "Rally", never anything else.
 */

export type ToolName =
  | 'catch_me_up'
  | 'summarize_channel'
  | 'my_commitments'
  | 'find_teammate'
  | 'remember'
  | 'propose_commitment'
  | 'propose_message'
  | 'propose_recognition'
  | 'propose_dispatch';

/** Tools the server runs directly and feeds back into the loop — all read-only or personal. */
export const SAFE_TOOLS: ReadonlySet<ToolName> = new Set([
  'catch_me_up',
  'summarize_channel',
  'my_commitments',
  'find_teammate',
  'remember', // writes the caller's OWN memory AND mirrors to the shared bus — a WRITE (see READ_ONLY_TOOLS)
]);

/**
 * The strictly read-only subset of SAFE_TOOLS (everything except `remember`). Offered when the
 * assistant runs on an UNTRUSTED, cross-app intent (the inbox handling a dispatched task): a task
 * another app's agent addressed to this user must never be able to trigger a server-side write —
 * no memory poisoning, no shared-bus writes. It can read and answer, nothing more.
 */
export const READ_ONLY_TOOLS: ReadonlySet<ToolName> = new Set([
  'catch_me_up',
  'summarize_channel',
  'my_commitments',
  'find_teammate',
]);

/** Tools that never execute server-side; they return a proposal the user must confirm. */
export const PROPOSE_TOOLS: ReadonlySet<ToolName> = new Set([
  'propose_commitment',
  'propose_message',
  'propose_recognition',
  'propose_dispatch',
]);

export function isSafeTool(name: string): name is ToolName {
  return SAFE_TOOLS.has(name as ToolName);
}
export function isProposeTool(name: string): name is ToolName {
  return PROPOSE_TOOLS.has(name as ToolName);
}

/** A drafted action returned to the client for one-tap confirmation. */
export type Proposal =
  | { kind: 'commitment'; text: string }
  | { kind: 'message'; channel: string; body: string }
  | { kind: 'recognition'; teammate: string; note: string }
  | { kind: 'dispatch'; app: string; intent: string };

/** The Anthropic tool schema. Kept here (not in the route) so it's covered by unit tests. */
export const ASSISTANT_TOOLS = [
  {
    name: 'catch_me_up',
    description: "Summarize what needs the user right now: recognitions awaiting their confirm, commitments due, and the busiest unread channel. Use when the user asks what's up, what they missed, or to be caught up.",
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'summarize_channel',
    description: 'Summarize or answer a question about one channel the user belongs to (e.g. "what did we decide in #general"). Reads only channels the user is a member of.',
    input_schema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel name, with or without the leading #.' },
        question: { type: 'string', description: 'Optional specific question; omit for a general summary.' },
      },
      required: ['channel'],
    },
  },
  {
    name: 'my_commitments',
    description: "List the user's open commitments (promises they are tracking) so you can remind them or reason about what's due.",
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'find_teammate',
    description: 'Find cohort members by name or GitHub handle, to mention or recognize them.',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Part of a name or handle.' } },
      required: ['query'],
    },
  },
  {
    name: 'remember',
    description: "Save a short, durable fact about the user to your private memory for future conversations (e.g. their goals, timezone, what they're working on). Only the user can ever see this.",
    input_schema: {
      type: 'object',
      properties: { note: { type: 'string', description: 'A concise fact worth remembering.' } },
      required: ['note'],
    },
  },
  {
    name: 'propose_commitment',
    description: 'Draft a commitment ("I\'ll do X by Y") for the user to confirm and track. Does NOT create it — the user confirms in the UI.',
    input_schema: {
      type: 'object',
      properties: { text: { type: 'string', description: 'The first-person promise text.' } },
      required: ['text'],
    },
  },
  {
    name: 'propose_message',
    description: 'Draft a message to post to a channel on the user\'s behalf, for them to confirm. Does NOT post it.',
    input_schema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel name, with or without #.' },
        body: { type: 'string', description: 'The message to post.' },
      },
      required: ['channel', 'body'],
    },
  },
  {
    name: 'propose_recognition',
    description: 'Draft recognition of a teammate who helped the user. The teammate still confirms it before any points are awarded — you can never award points yourself.',
    input_schema: {
      type: 'object',
      properties: {
        teammate: { type: 'string', description: 'Name or handle of the person who helped.' },
        note: { type: 'string', description: 'What they did.' },
      },
      required: ['teammate', 'note'],
    },
  },
  {
    name: 'propose_dispatch',
    description: "Hand a task to ANOTHER app's agent in the cohort suite (e.g. ask Pulse's agent to summarize the user's week). Use when the user asks for something another app owns. The user confirms before it is sent.",
    input_schema: {
      type: 'object',
      properties: {
        app: { type: 'string', description: 'The target app, e.g. "pulse".' },
        intent: { type: 'string', description: 'What you want that app\'s agent to do, in a short phrase.' },
      },
      required: ['app', 'intent'],
    },
  },
] as const;

/** Convert a validated propose-tool call into a typed Proposal (or null if malformed). */
export function toProposal(name: string, input: Record<string, unknown>): Proposal | null {
  if (name === 'propose_commitment' && typeof input.text === 'string' && input.text.trim()) {
    return { kind: 'commitment', text: input.text.trim() };
  }
  if (name === 'propose_message' && typeof input.channel === 'string' && typeof input.body === 'string' && input.body.trim()) {
    return { kind: 'message', channel: input.channel.replace(/^#/, '').trim(), body: input.body.trim() };
  }
  if (name === 'propose_recognition' && typeof input.teammate === 'string' && typeof input.note === 'string') {
    return { kind: 'recognition', teammate: input.teammate.trim(), note: input.note.trim() };
  }
  if (name === 'propose_dispatch' && typeof input.app === 'string' && input.app.trim() && typeof input.intent === 'string' && input.intent.trim()) {
    return { kind: 'dispatch', app: input.app.trim().toLowerCase(), intent: input.intent.trim() };
  }
  return null;
}
