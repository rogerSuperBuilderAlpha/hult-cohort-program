import { readFileSync } from 'fs';
import path from 'path';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

function loadServiceAccount(): Record<string, unknown> {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) return JSON.parse(json) as Record<string, unknown>;

  const accountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (accountPath) {
    const resolved = path.isAbsolute(accountPath)
      ? accountPath
      : path.join(process.cwd(), accountPath);
    return JSON.parse(readFileSync(resolved, 'utf8')) as Record<string, unknown>;
  }

  throw new Error(
    'Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.'
  );
}

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() ||
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim()
  );
}

export function getAdminApp(): App {
  if (!isAdminConfigured()) {
    throw new Error('Firebase Admin is not configured.');
  }
  if (!adminApp) {
    adminApp = getApps().length
      ? getApps()[0]!
      : initializeApp({ credential: cert(loadServiceAccount()) });
  }
  return adminApp;
}

export function getAdminDb(): Firestore {
  if (!adminDb) adminDb = getFirestore(getAdminApp());
  return adminDb;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) adminAuth = getAuth(getAdminApp());
  return adminAuth;
}
