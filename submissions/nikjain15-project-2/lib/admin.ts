import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

/**
 * Rally's Admin SDK half — the ONLY code that writes the points-bearing collections
 * (`xpEvents`, `pulseEvents`) and flips recognition points. Server-side only, and
 * rule-exempt by nature: firestore.rules deliberately makes those writes impossible from a
 * client, so a trusted server path has to be the one to do them. That split is what makes
 * "a client can never mint XP" true rather than aspirational.
 *
 * Credentials, in order:
 * - FIREBASE_SERVICE_ACCOUNT (JSON from the Firebase console) — production.
 * - FIRESTORE_EMULATOR_HOST — the emulator needs no credential, which is what makes every
 *   piece of this testable before the key exists.
 * - Neither → null, and the caller degrades loudly rather than pretending.
 */
export function adminDb(): Firestore | null {
  const app = ensureAdminApp();
  return app ? getFirestore() : null;
}

export function adminAuth(): Auth | null {
  const app = ensureAdminApp();
  return app ? getAuth() : null;
}

/**
 * The shared cross-app "context bus" (see @cohort/core/shared-context). In production this is a
 * dedicated Firebase project all the cohort's apps write to, selected by SHARED_FIREBASE_SERVICE_
 * ACCOUNT. Until that project exists, the bus transparently falls back to this app's own database
 * so shared context works within Rally today and flips to the real bus the moment the key is set —
 * the same degrade-don't-crash rule as everything else. Null only if no credential exists at all.
 */
export function busDb(): Firestore | null {
  const svc = process.env.SHARED_FIREBASE_SERVICE_ACCOUNT;
  if (svc) {
    try {
      const existing = getApps().find((a) => a.name === 'bus');
      const app = existing ?? initializeApp({ credential: cert(JSON.parse(svc) as Parameters<typeof cert>[0]) }, 'bus');
      return getFirestore(app);
    } catch {
      // A malformed shared key must not take the assistant down — fall back to the primary db.
      return adminDb();
    }
  }
  return adminDb();
}

function ensureAdminApp(): boolean {
  if (getApps().length > 0) return true;
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (svc) {
    try {
      initializeApp({ credential: cert(JSON.parse(svc) as Parameters<typeof cert>[0]) });
      return true;
    } catch {
      // A malformed key is "not configured", not a crash — the route reports it.
      return false;
    }
  }
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? 'demo-rally' });
    return true;
  }
  return false;
}
