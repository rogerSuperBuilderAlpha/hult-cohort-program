import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

/**
 * When the emulator is on, the real config is irrelevant — the SDK still demands a
 * projectId and a syntactically valid apiKey, so supply throwaways rather than requiring
 * a contributor to hold production credentials just to run the app locally.
 */
const useEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === '1';

const firebaseConfig = useEmulator
  ? { apiKey: 'demo-key', authDomain: 'localhost', projectId: 'demo-pulse', appId: 'demo-app' }
  : {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

// Next.js re-executes modules across HMR and route segments; reuse the app if present.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Point the SDK at the local emulator.
 *
 * This exists so development and testing never touch production. Test fixtures are not
 * product seed data: fake cohort activity in the collection reviewers read would make the
 * submission's central honesty claim false, and the claim is the strongest thing it has.
 *
 * Connects on the SERVER as well as the browser. It used to be gated on
 * `typeof window !== 'undefined'`, which quietly broke every server-side Firestore
 * caller — the /api/opt-out route handler and the landing page's opt-out filter both run
 * on the server and were reaching for production with a throwaway key.
 *
 * The globalThis flag is the re-entry guard: HMR re-runs this module, and connecting an
 * already-connected emulator throws.
 */
if (useEmulator && !(globalThis as EmulatorFlag).__pulseEmulator) {
  (globalThis as EmulatorFlag).__pulseEmulator = true;
  // Ports default to the firebase.json ones (8080/9099) and are overridable via env, so a
  // second concurrent emulator (e.g. another session's) can run on different ports without
  // colliding. Defaults unchanged, so production and normal `npm run test:e2e` are unaffected.
  const host = process.env.NEXT_PUBLIC_EMULATOR_HOST ?? '127.0.0.1';
  const fsPort = Number(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT ?? 8080);
  const authPort = Number(process.env.NEXT_PUBLIC_AUTH_EMULATOR_PORT ?? 9099);
  connectAuthEmulator(auth, `http://${host}:${authPort}`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, fsPort);
}

type EmulatorFlag = typeof globalThis & { __pulseEmulator?: boolean };

export default app;
