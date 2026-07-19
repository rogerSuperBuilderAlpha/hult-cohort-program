/**
 * Integration harness — the REAL lib/data functions against the REAL emulator.
 *
 * The rules tests (tests/rules) prove what the rules allow; the unit tests (tests/unit)
 * prove pure logic. Neither exercises the thing that actually bit real users: the
 * INTERACTION between createSensedTask's transaction, deleteTask, and a re-sync. That
 * only shows up when the real client functions run against a real Firestore with a real
 * signed-in identity — which is exactly this harness.
 *
 * Everything here runs as a genuine Auth-emulator user, so the firestore.rules under test
 * apply to every write, the same as in production. Fixtures never bypass rules.
 */
import { initializeApp, deleteApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
  type Auth,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore';

export const PROJECT_ID = 'demo-pulse';
const FIRESTORE_HOST = '127.0.0.1';
// Ports default to the firebase.json ones (8080/9099) and are overridable via env, so a run
// isolated onto a spare port (dodging a second concurrent emulator) hits the right one. Defaults
// unchanged, so production and normal `npm run test:integration` are unaffected.
const FIRESTORE_PORT = Number(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT ?? 8080);
const AUTH_URL = `http://127.0.0.1:${process.env.NEXT_PUBLIC_AUTH_EMULATOR_PORT ?? 9099}`;

/**
 * lib/firebase reads NEXT_PUBLIC_USE_EMULATOR at import time and connects the shared
 * singleton app to the emulator. The integration vitest project sets that env, so
 * importing lib/data/lib/sync here reuses that same emulator-connected app and db —
 * the exact objects the browser uses.
 */
export async function importAppDb(): Promise<Firestore> {
  const { db } = await import('@/lib/firebase');
  return db;
}

export type TestUser = { uid: string; name: string; photoURL: string | null; email: string };

let counter = 0;

/**
 * Create a fresh signed-in identity on the shared app that lib/data uses.
 *
 * Returns an Actor-shaped object. Because lib/firebase exports one singleton auth, the
 * "current user" is whoever signed in last — tests that need two identities at once must
 * use makeSecondaryUser (a separate FirebaseApp) instead.
 */
export async function signUpPrimary(namePrefix = 'user'): Promise<TestUser> {
  const { auth, db } = await import('@/lib/firebase');
  return signUpOn(auth as unknown as Auth, db as unknown as Firestore, namePrefix);
}

/**
 * Sign up, then create the member doc — exactly what ensureMember does on first auth in
 * the real app. Every signed-in member has a member doc, and the pulse create rule now
 * binds actorName to it, so a harness that skipped this would not match production.
 */
async function signUpOn(auth: Auth, db: Firestore, namePrefix: string): Promise<TestUser> {
  counter += 1;
  const email = `${namePrefix}-${Date.now()}-${counter}@emulator.test`;
  const name = `${namePrefix} ${counter}`;
  const cred = await createUserWithEmailAndPassword(auth, email, 'emulator-pw-123');
  await setDoc(doc(db, 'members', cred.user.uid), {
    uid: cred.user.uid,
    email,
    handle: null,
    displayName: name,
    photoURL: null,
    createdAt: serverTimestamp(),
  });
  return { uid: cred.user.uid, name, photoURL: null, email };
}

/**
 * A SECOND independent client, its own FirebaseApp + Firestore, its own auth session —
 * so a test can hold two signed-in members at once (the peer-attack and two-tab cases).
 */
export async function makeSecondaryClient(namePrefix = 'peer'): Promise<{
  db: Firestore;
  user: TestUser;
  cleanup: () => Promise<void>;
}> {
  const app: FirebaseApp = initializeApp(
    { apiKey: 'demo-key', authDomain: 'localhost', projectId: PROJECT_ID, appId: 'demo-app-2' },
    `secondary-${Date.now()}-${++counter}`
  );
  const auth = getAuth(app);
  connectAuthEmulator(auth, AUTH_URL, { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, FIRESTORE_HOST, FIRESTORE_PORT);
  const user = await signUpOn(auth, db, namePrefix);
  return {
    db,
    user,
    cleanup: async () => {
      await signOut(auth).catch(() => {});
      await deleteApp(app).catch(() => {});
    },
  };
}

export async function signOutPrimary(): Promise<void> {
  const { auth } = await import('@/lib/firebase');
  await signOut(auth as unknown as Auth).catch(() => {});
}

/** Wipe every document in the emulator between tests. */
export async function clearFirestore(): Promise<void> {
  await fetch(
    `http://${FIRESTORE_HOST}:${FIRESTORE_PORT}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' }
  );
}
