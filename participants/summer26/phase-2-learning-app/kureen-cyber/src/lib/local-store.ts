type StoredDoc = {
  docId: string;
  data: Record<string, unknown>;
  updatedAt: string;
};

type UserBucket = {
  events: StoredDoc[];
  sessions: Map<string, StoredDoc>;
};

declare global {
  var __interviewForgeStore: Map<string, UserBucket> | undefined;
}

function store() {
  if (!globalThis.__interviewForgeStore) {
    globalThis.__interviewForgeStore = new Map();
  }
  return globalThis.__interviewForgeStore;
}

function bucket(userSub: string): UserBucket {
  const s = store();
  let b = s.get(userSub);
  if (!b) {
    b = { events: [], sessions: new Map() };
    s.set(userSub, b);
  }
  return b;
}

export function localPutEvent(
  userSub: string,
  docId: string,
  data: Record<string, unknown>,
) {
  const b = bucket(userSub);
  const updatedAt = new Date().toISOString();
  b.events.unshift({ docId, data, updatedAt });
  b.events = b.events.slice(0, 100);
  return { docId, updatedAt };
}

export function localPutSession(
  userSub: string,
  sessionId: string,
  data: Record<string, unknown>,
) {
  const b = bucket(userSub);
  const existing = b.sessions.get(sessionId);
  const updatedAt = new Date().toISOString();
  const merged = { ...(existing?.data ?? {}), ...data };
  b.sessions.set(sessionId, { docId: sessionId, data: merged, updatedAt });
  return { docId: sessionId, updatedAt };
}

export function localListEvents(userSub: string, limit = 25) {
  const b = bucket(userSub);
  return {
    docs: b.events.slice(0, limit).map((d) => ({
      docId: d.docId,
      data: d.data,
      updatedAt: d.updatedAt,
    })),
    nextCursor: null as string | null,
  };
}

export function localListSessions(userSub: string, limit = 15) {
  const b = bucket(userSub);
  const docs = Array.from(b.sessions.values())
    .sort((a, c) => c.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit)
    .map((d) => ({
      docId: d.docId,
      data: d.data,
      updatedAt: d.updatedAt,
    }));
  return { docs, nextCursor: null as string | null };
}
