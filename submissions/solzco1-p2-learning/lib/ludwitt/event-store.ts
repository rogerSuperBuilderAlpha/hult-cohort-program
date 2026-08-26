import type { LearningEventType } from "@/lib/ludwitt/crypto";

export type StoredEvent = {
  event: LearningEventType;
  userId: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

const MAX = 500;
const store: StoredEvent[] = [];

export function appendEvent(row: StoredEvent): void {
  store.push(row);
  if (store.length > MAX) store.shift();
  console.info("[dealforge:event]", JSON.stringify(row));
}

export function listEventsForUser(userId: string, limit = 20): StoredEvent[] {
  return store.filter((e) => e.userId === userId).slice(-limit);
}
