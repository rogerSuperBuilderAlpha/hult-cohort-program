import fs from 'node:fs';
import path from 'node:path';
import { ledgerEntries, type LedgerEntry } from '@/data/ledger';
import { entryKey } from '@/lib/ledger-keys';
import type { EntryVerifyResult, VerifyChip } from '@/lib/verify-types';

export type { EntryVerifyResult, VerifyChip } from '@/lib/verify-types';

const CACHE_FILE = path.join(process.cwd(), '.cache', 'verify-results.json');
const DEPLOY_TIMEOUT_MS = 3000;

function parsePullRequest(prUrl?: string) {
  if (!prUrl) return null;
  const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2], number: Number(match[3]) };
}

async function fetchPullRequestState(prUrl?: string) {
  const parsed = parsePullRequest(prUrl);
  if (!parsed) return { state: 'unknown' as const };

  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'hult-cohort-showcase-verify',
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.number}`,
      { headers, next: { revalidate: 600 } },
    );
    if (!res.ok) return { state: 'unknown' as const };
    const data = (await res.json()) as { state?: string; merged_at?: string | null };
    if (data.merged_at) return { state: 'merged' as const };
    if (data.state === 'open') return { state: 'open' as const };
    if (data.state === 'closed') return { state: 'closed' as const };
    return { state: 'unknown' as const };
  } catch {
    return { state: 'unknown' as const };
  }
}

async function headDeploy(deployUrl?: string) {
  if (!deployUrl) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEPLOY_TIMEOUT_MS);
  try {
    const res = await fetch(deployUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'hult-cohort-verify/1.0' },
    });
    return res.status;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function chipFromSignals(
  prState: EntryVerifyResult['prState'],
  deployStatus: number | null,
  hasDeploy: boolean,
  hasPr: boolean,
): VerifyChip {
  if (!hasDeploy && !hasPr) return 'grey';
  const deployOk = deployStatus !== null && deployStatus >= 200 && deployStatus < 400;
  const deployBad = hasDeploy && !deployOk;

  if (deployBad) return 'red';
  if (prState === 'merged' && deployOk) return 'green';
  if (prState === 'open' || (deployOk && prState === 'unknown')) return 'amber';
  if (deployOk && (prState === 'closed' || prState === 'merged')) return 'green';
  if (hasDeploy && deployStatus === null) return 'red';
  return 'grey';
}

function detailFromSignals(
  prState: EntryVerifyResult['prState'],
  deployStatus: number | null,
  hasDeploy: boolean,
): string {
  const parts: string[] = [];
  if (prState !== 'unknown') parts.push(`PR ${prState}`);
  if (deployStatus !== null) parts.push(`deploy ${deployStatus}`);
  else if (hasDeploy) parts.push('deploy unreachable');
  return parts.join(' · ') || 'not yet indexed';
}

export function readVerifyCache(): Record<string, EntryVerifyResult> {
  if (!fs.existsSync(CACHE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) as Record<string, EntryVerifyResult>;
  } catch {
    return {};
  }
}

function writeVerifyCache(results: Record<string, EntryVerifyResult>) {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(results, null, 2));
}

async function verifyEntry(entry: LedgerEntry): Promise<EntryVerifyResult> {
  const key = entryKey(entry);
  const hasDeploy = Boolean(entry.deployUrl);
  const hasPr = Boolean(parsePullRequest(entry.prUrl));

  const [pr, deployStatus] = await Promise.all([
    fetchPullRequestState(entry.prUrl),
    headDeploy(entry.deployUrl),
  ]);

  const checkedAt = new Date().toISOString();
  const chip = chipFromSignals(pr.state, deployStatus, hasDeploy, hasPr);

  return {
    key,
    chip,
    prState: pr.state,
    deployStatus,
    checkedAt,
    stale: false,
    detail: detailFromSignals(pr.state, deployStatus, hasDeploy),
  };
}

export async function runVerification(): Promise<{
  results: EntryVerifyResult[];
  stale: boolean;
}> {
  const prior = readVerifyCache();
  const checkedAt = new Date().toISOString();
  let stale = false;

  const results: EntryVerifyResult[] = [];

  for (const entry of ledgerEntries) {
    const key = entryKey(entry);
    const needsLive = entry.deployUrl || parsePullRequest(entry.prUrl);

    if (!needsLive) {
      results.push({
        key,
        chip: 'grey',
        prState: 'unknown',
        deployStatus: null,
        checkedAt,
        stale: false,
        detail: 'not yet indexed',
      });
      continue;
    }

    try {
      results.push(await verifyEntry(entry));
    } catch {
      stale = true;
      const cached = prior[key];
      if (cached) {
        results.push({ ...cached, stale: true });
      } else {
        results.push({
          key,
          chip: 'grey',
          prState: 'unknown',
          deployStatus: null,
          checkedAt,
          stale: true,
          detail: 'verification unavailable',
        });
      }
    }
  }

  const map = Object.fromEntries(results.map((r) => [r.key, r]));
  writeVerifyCache(map);

  return { results, stale };
}
