/**
 * Environment bootstrap for staff CLI entrypoints (tsx/node).
 * Call at the top of staff scripts before any Admin import side effects.
 *
 * Two jobs:
 *  1. Load `.env.local` — notably GITHUB_TOKEN. Without it, GitHub Search runs
 *     unauthenticated (10 req/min) and contest-state/tally silently return
 *     partial or all-zero counts, which can name the wrong contest winner.
 *  2. Point Firebase Admin at the local service-account file if no credential
 *     is already set in the environment.
 */
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/** Minimal .env parser — real environment always wins over the file. */
function loadDotEnvLocal(dir: string): void {
  const file = path.join(dir, '../.env.local');
  if (!existsSync(file)) return;

  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!match) continue;
    const [, key] = match;
    if (process.env[key] !== undefined) continue;

    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

export function ensureStaffFirebaseEnv(importMetaUrl: string): void {
  const dir = path.dirname(fileURLToPath(importMetaUrl));

  loadDotEnvLocal(dir);

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) return;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim()) return;

  const candidate = path.join(dir, '../secrets/firebase-service-account.json');
  if (existsSync(candidate)) {
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH = candidate;
  }
}
