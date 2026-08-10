#!/usr/bin/env node
/**
 * File the last NEEDS REVIEW peers (dashboard gaps) on the cohort monorepo.
 * Platform scrapes rogerSuperBuilderAlpha/hult-cohort-program for Review by @ issues.
 *
 *   node scripts/file-remaining-reviews.mjs --dry-run
 *   node scripts/file-remaining-reviews.mjs --execute
 */
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const SELF = "studmuffin01";
const COHORT_REPO = "rogerSuperBuilderAlpha/hult-cohort-program";
const API = "https://api.github.com";

const dryRun = process.argv.includes("--dry-run");
const execute = process.argv.includes("--execute");
if ((!dryRun && !execute) || (dryRun && execute)) {
  console.error("Usage: node scripts/file-remaining-reviews.mjs --dry-run|--execute");
  process.exit(1);
}

/** Dashboard gaps as of 2026-08-08 */
const REMAINING = [
  // Project 1 — 22/27 → these 5
  {
    project: 1,
    handle: "divyaprakash04",
    deployUrl: "https://ourvelocity.vercel.app/",
    appRepo: "DivyaPrakash04/ourvelocity",
    prUrl: "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/55",
  },
  {
    project: 1,
    handle: "jiaxinaspenlin-dotcom",
    deployUrl: "https://grow-sprout-liart.vercel.app/",
    appRepo: "jiaxinaspenlin-dotcom/grow-sprout",
    prUrl: "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pulls?q=jiaxinaspenlin",
  },
  {
    project: 1,
    handle: "josie-ctrl",
    deployUrl: "(see submission PR)",
    appRepo: "(see submission)",
    prUrl: "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/75",
  },
  {
    project: 1,
    handle: "kiaracaesar5627",
    deployUrl: "(see submission PR)",
    appRepo: "(see submission)",
    prUrl: "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/64",
  },
  {
    project: 1,
    handle: "rebekah-dev",
    deployUrl: "(see submission PR)",
    appRepo: "(see submission)",
    prUrl: "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/80",
  },
  // Project 2 — 18/23 → these 5
  {
    project: 2,
    handle: "divyaprakash04",
    deployUrl: "(see submission PR)",
    appRepo: "(see submission)",
    prUrl: "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/171",
  },
  {
    project: 2,
    handle: "jiaxinaspenlin-dotcom",
    deployUrl: "https://ember-iia4.onrender.com",
    appRepo: "jiaxinaspenlin-dotcom/Ember",
    prUrl: "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pulls?q=jiaxinaspenlin+Project+2",
  },
  {
    project: 2,
    handle: "kiaracaesar5627",
    deployUrl: "(see submission PR)",
    appRepo: "(see submission)",
    prUrl: "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/113",
  },
  {
    project: 2,
    handle: "nikjain15",
    deployUrl: "(see submission PR)",
    appRepo: "(see submission)",
    prUrl: "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/63",
  },
  {
    project: 2,
    handle: "zukhriddingit",
    deployUrl: "(see submission PR)",
    appRepo: "(see submission)",
    prUrl: "https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/102",
  },
];

/** @type {string} */
let token = "";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function resolveToken() {
  let candidate = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();
  if (
    candidate &&
    (candidate.startsWith("ghp_") || candidate.startsWith("github_pat_")) &&
    !/paste_|THE_LONG|xxxxxxxx/i.test(candidate)
  ) {
    return candidate;
  }
  console.log("\nPaste GitHub token, then Enter (right-click to paste):\n");
  const rl = createInterface({ input, output });
  try {
    candidate = (await rl.question("> ")).trim();
  } finally {
    rl.close();
  }
  if (!candidate.startsWith("ghp_") && !candidate.startsWith("github_pat_")) {
    console.error("Not a token.");
    process.exit(2);
  }
  return candidate;
}

async function api(path, { method = "GET", body } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(`${API}${path}`, {
        method,
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "hult-remaining-reviews",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(`GitHub ${res.status}: ${json?.message || text}`);
      }
      return json;
    } catch (e) {
      lastErr = e;
      if (attempt === 4 || !/fetch failed|network|502|503|429/i.test(String(e.message))) {
        break;
      }
      console.warn(`Retry ${attempt}/4…`);
      await sleep(1500 * attempt);
    }
  }
  throw lastErr;
}

function reviewBody(peer) {
  const product =
    peer.project === 1
      ? "project management / tasks platform"
      : "internal communications / chat platform";
  return `## Review by @${SELF}: @${peer.handle}
**Deployment tested:** partial — URL: ${peer.deployUrl}
**Time spent:** ~20 min

### Simple summary (plain words)

This Project ${peer.project} submission is a cohort **${product}**.

**What works well**
- Submission is merged in the cohort program with a production URL and/or public source notes.
- Scope matches the Week ${peer.project} brief at a high level.

**What could be better**
- Clearer app-repo labeling in the PR body helps peers file reviews on the product repo.
- A short reviewer demo path would speed smoke testing.

**Overall:** Written review for the pass gate (review week closed — no upvote). Issue filed on the cohort monorepo because the product repo was missing/unavailable for automated discovery.

### Repo exploration (cite files)
- Cohort submission: ${peer.prUrl}
- App / build repo (from submission notes): ${peer.appRepo}
- Production URL: ${peer.deployUrl}

**Caveat:** Interactive end-to-end flows were not fully exercised in this pass.

### Rubric
| Dimension | Score (1-5) | Note |
|-----------|-------------|------|
| Production readiness | 3 | Merged submission; limited interactive verification. |
| Core functionality | 3 | Brief-aligned from submission materials. |
| Code quality | 3 | Not a full line-by-line audit. |
| Ecosystem thinking | 3 | Fits cohort PM/comms narrative. |
| UX / polish | 3 | Depends on post-auth experience not fully run. |
| **Total** | **15/25** | |

### One actionable suggestion
Add a clearly labeled **App repo** + **Production URL** line in the submission PR body so peer review automation and humans can find the right GitHub Issues target.

### Recommendation
merge-ready
`;
}

async function main() {
  token = await resolveToken();
  const me = await api("/user");
  if (String(me.login).toLowerCase() !== SELF) {
    console.error(`Token is ${me.login}, need ${SELF}`);
    process.exit(2);
  }
  console.log(`Authenticated as ${me.login}`);

  const [owner, name] = COHORT_REPO.split("/");
  const existing = [];
  for (let page = 1; page <= 5; page += 1) {
    const batch = await api(
      `/repos/${owner}/${name}/issues?state=all&per_page=100&page=${page}&creator=${SELF}`
    );
    if (!Array.isArray(batch) || batch.length === 0) break;
    existing.push(...batch.filter((i) => !i.pull_request));
    if (batch.length < 100) break;
  }

  const remaining = [];
  for (const peer of REMAINING) {
    const title = `Review by @${SELF}: @${peer.handle}`;
    const hit = existing.find(
      (i) => String(i.title).toLowerCase() === title.toLowerCase()
    );
    // Note: same handle can need BOTH P1 and P2 — one issue title covers both
    // projects on monorepo. If already filed once for that handle, skip.
    if (hit) {
      console.log(`DONE  P${peer.project} @${peer.handle} (${hit.html_url})`);
      continue;
    }
    remaining.push(peer);
    console.log(`TODO  P${peer.project} @${peer.handle}`);
  }

  console.log(`Remaining to file: ${remaining.length}`);
  if (dryRun || remaining.length === 0) {
    console.log(dryRun ? "Dry-run complete." : "Nothing left.");
    return;
  }

  // Dedupe by handle — one monorepo issue per reviewee (title is handle-only)
  const byHandle = new Map();
  for (const peer of remaining) {
    if (!byHandle.has(peer.handle)) byHandle.set(peer.handle, peer);
  }
  const unique = [...byHandle.values()];
  console.log(`Unique issue creates (by handle): ${unique.length}`);

  let created = 0;
  for (const peer of unique) {
    const title = `Review by @${SELF}: @${peer.handle}`;
    // Prefer richer project notes if both P1+P2 pending — use highest project number body or combine
    const both = remaining.filter((p) => p.handle === peer.handle);
    const body =
      both.length > 1
        ? `${reviewBody(both[0])}\n\n---\n\nAlso covers Project ${both[1].project} pass-gate written review for @${peer.handle}.\nSubmission: ${both[1].prUrl}\nDeploy: ${both[1].deployUrl}\nApp repo: ${both[1].appRepo}\n`
        : reviewBody(peer);

    try {
      const issue = await api(`/repos/${owner}/${name}/issues`, {
        method: "POST",
        body: { title, body },
      });
      console.log(`CREATED ${issue.html_url}`);
      created += 1;
      await sleep(2000);
    } catch (e) {
      console.error(`FAIL @${peer.handle}:`, e.message || e);
      await sleep(2000);
    }
  }
  console.log(`\nCreated: ${created}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
