/**
 * The cross-app "context bus" contract — pure, dependency-free, and IDENTICAL across every
 * cohort app (Rally's `@cohort/core/shared-context`, Pulse's copy here). It must stay byte-for-byte
 * the same in every app or the shared brain fractures: the whole point is that any app can read and
 * write the same paths, keyed by the stable GitHub handle rather than a per-app Firebase uid.
 *
 * No Firestore, no SDK, no app-specific anything — just the paths, the shapes, and the task
 * lifecycle, so all of it is unit-testable without a live model or database.
 */

export const BUS = {
  contexts: 'cohortContext',
  context: (handle: string) => `cohortContext/${contextKey(handle)}`,
  memory: (handle: string) => `cohortContext/${contextKey(handle)}/memory`,
  activity: (handle: string) => `cohortContext/${contextKey(handle)}/activity`,
  tasks: 'agentTasks',
} as const;

export function contextKey(handle: string | null | undefined): string {
  return (handle ?? '').trim().toLowerCase();
}
export function isValidHandle(handle: string | null | undefined): boolean {
  return contextKey(handle).length > 0;
}

export type SharedMemoryNote = { app: string; text: string; createdAt: number };
export type SharedActivity = { app: string; kind: string; summary: string; createdAt: number };
export type AgentTaskStatus = 'pending' | 'claimed' | 'done' | 'failed';
export type AgentTask = {
  id?: string; fromApp: string; toApp: string; handle: string; intent: string;
  payload: Record<string, unknown>; status: AgentTaskStatus; result: string | null;
  createdAt: number; updatedAt: number;
};

export function newAgentTask(
  input: { fromApp: string; toApp: string; handle: string; intent: string; payload?: Record<string, unknown> },
  nowMs: number,
): AgentTask {
  return {
    fromApp: input.fromApp, toApp: input.toApp, handle: contextKey(input.handle),
    intent: input.intent, payload: input.payload ?? {}, status: 'pending', result: null,
    createdAt: nowMs, updatedAt: nowMs,
  };
}

const ALLOWED: Record<AgentTaskStatus, AgentTaskStatus[]> = {
  pending: ['claimed', 'failed'], claimed: ['done', 'failed'], done: [], failed: [],
};
export function canTransition(from: AgentTaskStatus, to: AgentTaskStatus): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}
