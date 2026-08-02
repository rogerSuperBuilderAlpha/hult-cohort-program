import fs from 'node:fs';
import path from 'node:path';

const ROSTER_HANDLES = [
  'ryanroper79-alt',
  'CodingWCal',
  'ramyatolety',
  'raven-dubgub',
  'r3s0lv343vr',
  'priyanshshahh',
  'joes9987',
  'kureen-cyber',
  'gge513',
  'rogersuperbuilderalpha',
  'studmuffin01',
];

const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'github-profiles.json');

type GhUser = {
  name?: string | null;
  bio?: string | null;
  avatar_url?: string;
  blog?: string;
};

async function fetchProfile(handle: string): Promise<GhUser | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(handle)}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'hult-cohort-showcase' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as GhUser;
    return data;
  } catch {
    return null;
  }
}

async function main() {
  let existing: Record<string, GhUser> = {};
  if (fs.existsSync(CACHE_FILE)) {
    existing = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) as Record<string, GhUser>;
  }

  const merged = { ...existing };
  for (const handle of ROSTER_HANDLES) {
    const key = handle.toLowerCase();
    if (merged[key]?.avatar_url) continue;
    const profile = await fetchProfile(handle);
    if (profile) merged[key] = profile;
    await new Promise((r) => setTimeout(r, 120));
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(merged, null, 2));
  console.log(`Cached ${Object.keys(merged).length} GitHub profiles → ${CACHE_FILE}`);
}

main().catch((err) => {
  console.warn('GitHub roster enrich skipped:', err);
  process.exit(0);
});
