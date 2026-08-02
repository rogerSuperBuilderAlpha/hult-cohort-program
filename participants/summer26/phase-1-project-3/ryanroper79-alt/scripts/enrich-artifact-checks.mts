import fs from 'node:fs';
import path from 'node:path';
import { ledgerEntries } from '../data/ledger.ts';

type CheckResult = {
  status: 'checked' | 'not-yet-checked';
  entryKey: string;
  deployUrl?: string;
  checkedAt?: string;
  lighthouse?: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  };
  axeCriticalCount?: number | null;
  transferWeightKb?: number | null;
  timeToInteractiveMs?: number | null;
};

function entryKey(entry: { handle: string; week: number; projectSlug: string }) {
  return `${entry.handle}-w${entry.week}-${entry.projectSlug}`;
}

function scoreFromCategory(categories: Record<string, { score?: number | null }>, id: string) {
  const s = categories[id]?.score;
  return s == null ? null : Math.round(s * 100);
}

async function runPageSpeed(url: string) {
  const psiUrl =
    `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?` +
    `url=${encodeURIComponent(url)}&strategy=mobile` +
    `&category=performance&category=accessibility&category=best-practices&category=seo`;

  const res = await fetch(psiUrl, { signal: AbortSignal.timeout(90_000) });
  if (!res.ok) throw new Error(`PSI ${res.status}`);
  const data = (await res.json()) as {
    lighthouseResult?: {
      categories?: Record<string, { score?: number | null }>;
      audits?: Record<string, { numericValue?: number }>;
    };
  };
  const lr = data.lighthouseResult;
  if (!lr?.categories) throw new Error('No lighthouse categories');
  return {
    lighthouse: {
      performance: scoreFromCategory(lr.categories, 'performance'),
      accessibility: scoreFromCategory(lr.categories, 'accessibility'),
      bestPractices: scoreFromCategory(lr.categories, 'best-practices'),
      seo: scoreFromCategory(lr.categories, 'seo'),
    },
    transferWeightKb: (lr.audits?.['total-byte-weight']?.numericValue ?? 0) / 1024,
    timeToInteractiveMs: lr.audits?.interactive?.numericValue ?? null,
  };
}

async function checkEntry(deployUrl: string, key: string): Promise<CheckResult> {
  try {
    const psi = await runPageSpeed(deployUrl).catch(() => null);
    if (!psi) return { status: 'not-yet-checked', entryKey: key, deployUrl };

    return {
      status: 'checked',
      entryKey: key,
      deployUrl,
      checkedAt: new Date().toISOString(),
      lighthouse: psi.lighthouse,
      axeCriticalCount: null,
      transferWeightKb: psi.transferWeightKb,
      timeToInteractiveMs: psi.timeToInteractiveMs,
    };
  } catch {
    return { status: 'not-yet-checked', entryKey: key, deployUrl };
  }
}

async function main() {
  const CACHE_DIR = path.join(process.cwd(), '.cache');
  const CACHE_FILE = path.join(CACHE_DIR, 'artifact-checks.json');

  let existing: Record<string, CheckResult> = {};
  if (fs.existsSync(CACHE_FILE)) {
    existing = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) as Record<string, CheckResult>;
  }

  const targets = ledgerEntries.filter((e) => e.deployUrl && (e.featured || e.week === 3)).slice(0, 4);

  for (const entry of targets) {
    const key = entryKey(entry);
    const url = entry.deployUrl!;
    console.log(`Checking artifact ${key} → ${url}`);
    existing[key] = await checkEntry(url, key);
    await new Promise((r) => setTimeout(r, 3000));
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(existing, null, 2));
  console.log(`Cached ${Object.keys(existing).length} artifact checks → ${CACHE_FILE}`);
}

main().catch((err) => {
  console.warn('Artifact check enrich skipped:', err);
  process.exit(0);
});
