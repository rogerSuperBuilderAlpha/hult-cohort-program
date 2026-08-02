import fs from 'node:fs';
import path from 'node:path';
import type { ArtifactCheckResult } from '@/lib/artifact-check-types';

const cacheFile = path.join(process.cwd(), '.cache', 'artifact-checks.json');

let cache: Record<string, ArtifactCheckResult> = {};

if (fs.existsSync(cacheFile)) {
  try {
    cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8')) as Record<string, ArtifactCheckResult>;
  } catch {
    cache = {};
  }
}

export function getArtifactCheck(entryKey: string): ArtifactCheckResult {
  const hit = cache[entryKey];
  if (hit?.status === 'checked') return hit;
  return {
    status: 'not-yet-checked',
    entryKey,
    note: 'Automated checks run at build time against deploy URLs. Re-run build to refresh.',
  };
}

export function allArtifactChecks(): Record<string, ArtifactCheckResult> {
  return cache;
}
