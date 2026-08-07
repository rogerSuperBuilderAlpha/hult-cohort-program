/**
 * @cohort/core/shared-context — the cross-app "context bus" contract.
 *
 * The Hult cohort is becoming a SUITE of apps (Pulse, Rally, and more to come). For the suite to
 * feel like one product, the apps must share a common context — who the user is, what they're
 * working on, a shared history — and their agents must be able to hand work to one another
 * ("Rally, ask Pulse's agent to do X").
 *
 * This module is the CONTRACT, not the plumbing: pure paths, types, and lifecycle helpers with no
 * Firebase dependency, so every app can implement the thin admin read/write itself and still
 * converge on the exact same shape. The bus is a single Firestore instance all apps' servers write
 * to (a dedicated shared project in production).
 *
 * The cross-app key is the GitHub HANDLE, never a Firebase uid: each app authenticates the same
 * person against its own Firebase project and gets a different uid, but the GitHub login is stable
 * across all of them. Everything on the bus is keyed by `contextKey(handle)`.
 */
/** Collection/doc paths on the bus. Kept in one place so every app agrees byte-for-byte. */
export declare const BUS: {
    /** One profile-ish context doc per person: `cohortContext/{key}`. */
    readonly contexts: "cohortContext";
    readonly context: (handle: string) => string;
    /** Shared, append-only memory notes any app writes and every app reads. */
    readonly memory: (handle: string) => string;
    /** Shared activity timeline — the common history across apps. */
    readonly activity: (handle: string) => string;
    /** Agent-to-agent work items: one app asks another app's agent to do something. */
    readonly tasks: "agentTasks";
};
/** The normalized cross-app key. Handles are case-insensitive; empty is invalid (returns ''). */
export declare function contextKey(handle: string | null | undefined): string;
export declare function isValidHandle(handle: string | null | undefined): boolean;
/** A durable fact about the user, written by one app, readable by all. */
export type SharedMemoryNote = {
    app: string;
    text: string;
    createdAt: number;
};
/** A shared history event — what the user did in any app. */
export type SharedActivity = {
    app: string;
    kind: string;
    summary: string;
    createdAt: number;
};
export type AgentTaskStatus = 'pending' | 'claimed' | 'done' | 'failed';
/** A unit of work one app's agent asks another app's agent to perform. */
export type AgentTask = {
    id?: string;
    fromApp: string;
    toApp: string;
    handle: string;
    intent: string;
    payload: Record<string, unknown>;
    status: AgentTaskStatus;
    result: string | null;
    createdAt: number;
    updatedAt: number;
};
/** Build a fresh pending task (pure — the caller persists it). */
export declare function newAgentTask(input: {
    fromApp: string;
    toApp: string;
    handle: string;
    intent: string;
    payload?: Record<string, unknown>;
}, nowMs: number): AgentTask;
/** Legal task lifecycle: pending → claimed → done|failed (claimed can also fail). */
export declare function canTransition(from: AgentTaskStatus, to: AgentTaskStatus): boolean;
