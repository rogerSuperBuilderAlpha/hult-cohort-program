/**
 * Shared, app-agnostic types for the cohort apps.
 *
 * Rally's rich domain types (Channel, Message, Recognition, …) live here too so that app
 * code AND the Firestore rules tests share one definition — the rules are the load-bearing
 * security surface, and a drifting type would let a test assert against a shape the app
 * never writes. Keep this UI-free.
 */
export {};
