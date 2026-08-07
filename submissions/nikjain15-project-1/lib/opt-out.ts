import type { PublicMember } from './cohort';

/**
 * ⚠️ **REST, not the Firebase SDK, and that is deliberate.**
 *
 * This module runs on the SERVER (a route handler and the landing page's server
 * component). `firebase/firestore` is the *web* SDK: from Node it fails to open its
 * channel and every read comes back "Failed to get document because the client is
 * offline" — which surfaced here as a silently failing opt-out, the worst bug this
 * feature can have.
 *
 * The usual answer is firebase-admin, but that needs a service-account credential that
 * doesn't exist yet. Firestore's REST API needs no SDK and no credential: the rules allow
 * unauthenticated create on `optOuts` by design, because leaving must not cost you an
 * account. The rules are still what enforce the boundary — REST is not a way around them.
 */

/**
 * Opt-out — the tombstone. DESIGN-SPEC §5.0.
 *
 * ⚠️ **What this is not.** The spec says "delete their `CohortMember` doc". There is no doc
 * to delete: `buildCohortSnapshot` reads the public repo live on every render (ISR, 15 min)
 * and builds the cohort in memory — nothing about a non-member is ever persisted. Deleting
 * a doc would be theatre, and next render would rebuild the person from GitHub anyway.
 *
 * So the tombstone is the whole mechanism, and it is the part the spec actually needed: a
 * durable record that a handle must never be shown, which the pre-index's callers filter
 * against. It survives the ISR rebuild precisely because it lives outside it.
 *
 * This module is deliberately free of `lib/github.ts` — that module reads GITHUB_TOKEN and
 * is server-only, and the opt-out page is a client component with no auth gate in front of
 * it. Nothing here needs GitHub.
 */

export const OPT_OUTS = 'optOuts';

/**
 * A tombstoned handle. Doc id is the lowercased handle: GitHub logins are case-preserving
 * but case-insensitive, so `NikJain15` and `nikjain15` are one person and must be one
 * tombstone — otherwise opting out under the wrong casing silently does nothing.
 */
export type OptOut = {
  handle: string;
  createdAt: unknown;
};

/**
 * GitHub's own login rule: alphanumerics and single hyphens, no leading/trailing hyphen,
 * 39 chars max. Validated because the handle becomes a document id — a slash or an empty
 * string is a malformed write, not a person.
 */
const LOGIN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/;

/** Accepts "@Nik", " nikjain15 ", or a profile URL's tail. Returns null if it isn't a login. */
export function normaliseHandle(input: string): string | null {
  const handle = input.trim().replace(/^@/, '').toLowerCase();
  return LOGIN.test(handle) ? handle : null;
}

/**
 * Record the tombstone. Idempotent — asking twice is not an error, it's someone who
 * wasn't sure it worked the first time.
 *
 * Server-side (a route handler), because the rules permit create-only on this collection
 * and the write must not be gated on the caller having an account. Removal is never gated
 * on us: erring toward removing someone who asked is the right direction to fail in.
 */
/** The REST root — the emulator when NEXT_PUBLIC_USE_EMULATOR is on, production otherwise. */
function documentsUrl(): string {
  const emulator = process.env.NEXT_PUBLIC_USE_EMULATOR === '1';
  const project = emulator ? 'demo-pulse' : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const host = emulator ? 'http://127.0.0.1:8080' : 'https://firestore.googleapis.com';
  return `${host}/v1/projects/${project}/databases/(default)/documents`;
}

export async function tombstoneHandle(handle: string): Promise<void> {
  const res = await fetch(`${documentsUrl()}/${OPT_OUTS}?documentId=${encodeURIComponent(handle)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        handle: { stringValue: handle },
        createdAt: { timestampValue: new Date().toISOString() },
      },
    }),
    cache: 'no-store',
  });

  // 409 = already tombstoned. Asking twice is not an error — it's someone who wasn't sure
  // it worked the first time, and the answer they deserve is "yes, you're removed".
  if (res.ok || res.status === 409) return;

  throw new Error(`optOuts create failed: ${res.status}`);
}

/** Every tombstoned handle, lowercased. */
export async function fetchOptOuts(): Promise<Set<string>> {
  // no-store: a tombstone must take effect now. A cached list would keep showing someone
  // for the length of the cache window after they asked to be gone.
  const res = await fetch(`${documentsUrl()}/${OPT_OUTS}?pageSize=300`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`optOuts read failed: ${res.status}`);

  const body = (await res.json()) as { documents?: { name: string }[] };
  return new Set((body.documents ?? []).map((d) => d.name.split('/').pop()!.toLowerCase()));
}

export function withoutOptedOut(members: PublicMember[], tombstoned: Set<string>): PublicMember[] {
  return members.filter((m) => !tombstoned.has(m.handle.toLowerCase()));
}

/**
 * **The function the landing page calls.** Wrap `buildCohortSnapshot().members` in this and
 * a tombstoned person is gone from the page.
 *
 * ⚠️ If Firestore is unreachable this **throws rather than returning everyone**. That is the
 * deliberate choice: falling back to the unfiltered list would quietly show a person who
 * asked to be removed, which is the one failure this page exists to prevent. Showing nobody
 * for fifteen minutes is recoverable; showing someone who opted out is not.
 */
export async function removeOptedOut(members: PublicMember[]): Promise<PublicMember[]> {
  return withoutOptedOut(members, await fetchOptOuts());
}
