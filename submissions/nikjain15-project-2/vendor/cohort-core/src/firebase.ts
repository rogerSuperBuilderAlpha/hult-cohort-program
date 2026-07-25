import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

/**
 * Shared client-side Firebase init for the cohort apps.
 *
 * When the emulator is on, the real config is irrelevant — the SDK still demands a
 * projectId and a syntactically valid apiKey, so supply throwaways rather than requiring
 * a contributor to hold production credentials just to run the app locally. The emulator
 * projectId is read from NEXT_PUBLIC_EMULATOR_PROJECT so each app (Pulse: demo-pulse,
 * Rally: demo-rally) keeps its own isolated local dataset.
 */
const useEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === '1';
const emulatorProject = process.env.NEXT_PUBLIC_EMULATOR_PROJECT || 'demo-cohort';

const firebaseConfig = useEmulator
  ? { apiKey: 'demo-key', authDomain: 'localhost', projectId: emulatorProject, appId: 'demo-app' }
  : {
      // getAuth() throws `auth/invalid-api-key` at import if apiKey is empty — which happens
      // during a build with no env set (e.g. the local gate / CI), where every page is still
      // prerendered on the server and this module is imported. The placeholder keeps init from
      // throwing; NEXT_PUBLIC_* are inlined at BUILD time, so a real Vercel build with env set
      // ships the real key and this fallback is never reached. A bad key only ever surfaces at
      // an actual runtime auth call (browser), which only occurs when the real env was present.
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'missing-api-key',
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
 * Point the SDK at the local emulator. Connects on the SERVER as well as the browser —
 * route handlers using the client SDK must also hit the emulator, never production. The
 * globalThis flag is the re-entry guard: HMR re-runs this module, and connecting an
 * already-connected emulator throws.
 */
if (useEmulator && !(globalThis as EmulatorFlag).__cohortEmulator) {
  (globalThis as EmulatorFlag).__cohortEmulator = true;
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

type EmulatorFlag = typeof globalThis & { __cohortEmulator?: boolean };

export default app;
