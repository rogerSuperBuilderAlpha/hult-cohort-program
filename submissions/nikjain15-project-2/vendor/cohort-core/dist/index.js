/**
 * @cohort/core — shared, UI-free core for the Hult cohort apps (Pulse + Rally).
 *
 * Import subpaths (e.g. `@cohort/core/firebase`) in client bundles to keep this tree-shakeable;
 * the barrel is for server/test code that wants several pieces at once. `firebase.ts` pulls in
 * the Firebase client SDK, so it is intentionally NOT re-exported here — import it directly.
 */
export * from './types';
export * from './cohort';
export * from './rate-limit';
export * from './github-repo';
export * from './shared-context';
