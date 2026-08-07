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
export const BUS = {
    /** One profile-ish context doc per person: `cohortContext/{key}`. */
    contexts: 'cohortContext',
    context: (handle) => `cohortContext/${contextKey(handle)}`,
    /** Shared, append-only memory notes any app writes and every app reads. */
    memory: (handle) => `cohortContext/${contextKey(handle)}/memory`,
    /** Shared activity timeline — the common history across apps. */
    activity: (handle) => `cohortContext/${contextKey(handle)}/activity`,
    /** Agent-to-agent work items: one app asks another app's agent to do something. */
    tasks: 'agentTasks',
};
/** The normalized cross-app key. Handles are case-insensitive; empty is invalid (returns ''). */
export function contextKey(handle) {
    return (handle ?? '').trim().toLowerCase();
}
export function isValidHandle(handle) {
    return contextKey(handle).length > 0;
}
/** Build a fresh pending task (pure — the caller persists it). */
export function newAgentTask(input, nowMs) {
    return {
        fromApp: input.fromApp,
        toApp: input.toApp,
        handle: contextKey(input.handle),
        intent: input.intent,
        payload: input.payload ?? {},
        status: 'pending',
        result: null,
        createdAt: nowMs,
        updatedAt: nowMs,
    };
}
const ALLOWED = {
    pending: ['claimed', 'failed'],
    claimed: ['done', 'failed'],
    done: [],
    failed: [],
};
/** Legal task lifecycle: pending → claimed → done|failed (claimed can also fail). */
export function canTransition(from, to) {
    return ALLOWED[from]?.includes(to) ?? false;
}
