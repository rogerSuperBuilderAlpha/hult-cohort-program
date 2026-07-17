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
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

type EmulatorFlag = typeof globalThis & { __pulseEmulator?: boolean };

export default app;
