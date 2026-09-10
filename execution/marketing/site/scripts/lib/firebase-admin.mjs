import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) return JSON.parse(json);

  const accountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
    path.join(__dirname, '../../secrets/firebase-service-account.json');
  const resolved = path.isAbsolute(accountPath)
    ? accountPath
    : path.join(process.cwd(), accountPath);
  return JSON.parse(readFileSync(resolved, 'utf8'));
}

export function initAdmin() {
  if (getApps().length) return getApps()[0];
  return initializeApp({ credential: cert(loadServiceAccount()) });
}

export function initDb() {
  return getFirestore(initAdmin());
}

export function initAuth() {
  return getAuth(initAdmin());
}

export function cohortIdFromEnv() {
  return process.env.COHORT_ID?.trim() || 'fall26';
}

export function cohortRepoFromEnv() {
  return process.env.NEXT_PUBLIC_COHORT_REPO?.trim() || 'rogerSuperBuilderAlpha/hult-cohort-program';
}

export function cohortOrgFromEnv() {
  const fromEnv = process.env.NEXT_PUBLIC_COHORT_ORG?.trim();
  if (fromEnv) return fromEnv;
  const repo = cohortRepoFromEnv();
  const slash = repo.indexOf('/');
  return slash > 0 ? repo.slice(0, slash) : 'rogerSuperBuilderAlpha';
}
