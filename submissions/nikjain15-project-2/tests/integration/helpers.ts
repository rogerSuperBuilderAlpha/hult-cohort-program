/**
 * Integration harness — the REAL lib/data functions against the REAL emulator, as genuine
 * Auth-emulator users so firestore.rules apply to every write exactly as in the browser.
 *
 * The app signs in with GitHub; the Auth emulator also accepts email/password, so the harness
 * uses that to mint a signed-in uid (the rules only care about the uid). @cohort/core/firebase
 * reads NEXT_PUBLIC_USE_EMULATOR at import and connects the shared app to the emulator; the
 * integration vitest project sets it, so importing lib/data reuses that same emulator app.
 */
import { initializeApp, deleteApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
  updateProfile,
  type Auth,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import { invalidateLeaderboard } from '@/lib/leaderboard-admin';

export const PROJECT_ID = 'demo-rally';
const FIRESTORE_HOST = '127.0.0.1';
const FIRESTORE_PORT = 8080;
const AUTH_URL = 'http://127.0.0.1:9099';

export type TestUser = { uid: string; name: string };

let counter = 0;

export async function importAppDb(): Promise<Firestore> {
  const { db } = await import('@cohort/core/firebase');
  return db as unknown as Firestore;
}

/** Sign in a fresh identity on the shared app that lib/data uses. */
export async function signUpPrimary(namePrefix = 'user'): Promise<TestUser> {
  const { auth } = await import('@cohort/core/firebase');
  counter += 1;
  const email = `${namePrefix}-${Date.now()}-${counter}@emulator.test`;
  const name = `${namePrefix} ${counter}`;
  const cred = await createUserWithEmailAndPassword(auth as unknown as Auth, email, 'emulator-pw-123');
  await updateProfile(cred.user, { displayName: name });
  return { uid: cred.user.uid, name };
}

export async function signOutPrimary(): Promise<void> {
  const { auth } = await import('@cohort/core/firebase');
  await signOut(auth as unknown as Auth).catch(() => {});
}

/** A second independent client (own app/auth/db) so a test can hold two members at once. */
export async function makeSecondaryClient(namePrefix = 'peer'): Promise<{
  db: Firestore;
  user: TestUser;
  cleanup: () => Promise<void>;
}> {
  const app: FirebaseApp = initializeApp(
    { apiKey: 'demo-key', authDomain: 'localhost', projectId: PROJECT_ID, appId: 'demo-app-2' },
    `secondary-${Date.now()}-${++counter}`,
  );
  const auth = getAuth(app);
  connectAuthEmulator(auth, AUTH_URL, { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, FIRESTORE_HOST, FIRESTORE_PORT);
  counter += 1;
  const email = `${namePrefix}-${Date.now()}-${counter}@emulator.test`;
  const name = `${namePrefix} ${counter}`;
  const cred = await createUserWithEmailAndPassword(auth, email, 'emulator-pw-123');
  await updateProfile(cred.user, { displayName: name });
  return {
    db,
    user: { uid: cred.user.uid, name },
    cleanup: async () => {
      await signOut(auth).catch(() => {});
      await deleteApp(app).catch(() => {});
    },
  };
}

export async function clearFirestore(): Promise<void> {
  await fetch(
    `http://${FIRESTORE_HOST}:${FIRESTORE_PORT}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' },
  );
  // The leaderboard keeps a short in-memory cache of the computed ranking (module-level, per
  // process). Wiping the DB must also drop it, or a prior test's cached board would leak into the
  // next test that reads the leaderboard before the TTL elapses.
  invalidateLeaderboard();
}

/** Poll a live-updating getter until it satisfies `pred` or times out. */
export async function until<T>(get: () => T, pred: (v: T) => boolean, ms = 4000): Promise<T> {
  const start = Date.now();
  // Date.now in a test is fine (not a workflow script).
  while (Date.now() - start < ms) {
    const v = get();
    if (pred(v)) return v;
    await new Promise((r) => setTimeout(r, 50));
  }
  return get();
}
