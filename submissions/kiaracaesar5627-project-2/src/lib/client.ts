import type {
  Channel,
  Conversation,
  Message,
  Notification,
  User,
} from "./types";

/**
 * Process-local store for Huddle.
 * On Vercel this lives in the serverless isolate (resets on cold start; auto-seeded).
 * Avoids native @libsql/client binaries that break Vercel serverless packaging.
 */

export type Store = {
  users: Map<string, User>;
  channels: Map<string, Channel>;
  conversations: Map<string, Conversation>;
  conversationMembers: Map<string, Set<string>>;
  messages: Map<string, Message>;
  notifications: Map<string, Notification>;
  ready: boolean;
};

declare global {
  var __commsStore: Store | undefined;
}

function emptyStore(): Store {
  return {
    users: new Map(),
    channels: new Map(),
    conversations: new Map(),
    conversationMembers: new Map(),
    messages: new Map(),
    notifications: new Map(),
    ready: false,
  };
}

export function getStore(): Store {
  if (!globalThis.__commsStore) {
    globalThis.__commsStore = emptyStore();
  }
  return globalThis.__commsStore;
}

/** Schema init is a no-op for the in-memory store (kept for call-site compatibility). */
export async function ensureSchema() {
  const store = getStore();
  store.ready = true;
}

export function newId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
}

export function nowIso() {
  return new Date().toISOString();
}
