/**
 * Ensure staff scripts can find Firebase Admin credentials without sourcing .env.local.
 * Call at the top of tsx/node staff entrypoints before any Admin import side effects.
 */
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function ensureStaffFirebaseEnv(importMetaUrl: string): void {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) return;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim()) return;

  const dir = path.dirname(fileURLToPath(importMetaUrl));
  const candidate = path.join(dir, '../secrets/firebase-service-account.json');
  if (existsSync(candidate)) {
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH = candidate;
  }
}
