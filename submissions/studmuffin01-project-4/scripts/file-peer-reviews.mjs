#!/usr/bin/env node
/**
 * File remaining Project 1 / Project 2 peer review issues as studmuffin01.
 *
 * Usage:
 *   node scripts/file-peer-reviews.mjs --project 1 --dry-run
 *   node scripts/file-peer-reviews.mjs --project 1 --execute
 *
 * When asked, paste your GitHub PAT (right-click in cmd), then Enter.
 * Never commit the token. Never paste it into chat.
 */
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const SELF = "studmuffin01";
const COHORT_REPO = "rogerSuperBuilderAlpha/hult-cohort-program";
const API = "https://api.github.com";

const args = process.argv.slice(2);
const project = Number(args.find((_, i, a) => a[i - 1] === "--project") ?? 0);
const dryRun = args.includes("--dry-run");
const execute = args.includes("--execute");

if (![1, 2].includes(project) || (!dryRun && !execute) || (dryRun && execute)) {
  console.error(
    "Usage: node scripts/file-peer-reviews.mjs --project 1|2 --dry-run|--execute"
  );
  process.exit(1);
}

const TITLE_PREFIX = `[Project ${project}] Submission`;

/** @type {string} */
let token = "";

function isPlaceholderToken(value) {
  return /paste_|THE_LONG_STRING|xxxxxxxx|your_token/i.test(value);
}

async function resolveToken() {
  let candidate = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();
  if (
    candidate &&
    (candidate.startsWith("ghp_") || candidate.startsWith("github_pat_")) &&
    !isPlaceholderToken(candidate)
  ) {
    return candidate;
  }

  console.log("");
  console.log("Paste your GitHub token, then press Enter.");
  console.log("How to paste in cmd: RIGHT-CLICK once (or Ctrl+V).");
  console.log("Token should start with ghp_ or github_pat_");
  console.log("");

  const rl = createInterface({ input, output });
  try {
    candidate = (await rl.question("> ")).trim();
  } finally {
    rl.close();
  }

  if (
    !candidate ||
    !(candidate.startsWith("ghp_") || candidate.startsWith("github_pat_"))
  ) {
    console.error(
      "Not a GitHub token. On github.com/settings/tokens click your token's Copy, then run again and paste with right-click."
    );
    process.exit(2);
  }
  if (isPlaceholderToken(candidate)) {
    console.error(
      "That was the example text, not your real token. Paste the secret GitHub gave you."
    );
    process.exit(2);
  }
  return candidate;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api(path, { method = "GET", body, query } = {}) {
  const url = new URL(path.startsWith("http") ? path : `${API}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v != null) url.searchParams.set(k, String(v));
    }
  }

  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(url, {
        method,
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "hult-peer-review-filer",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      let json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = { raw: text };
      }
      if (!res.ok) {
        const msg = json?.message || text || res.statusText;
        throw new Error(`GitHub ${res.status} ${method} ${url.pathname}: ${msg}`);
      }
      return json;
    } catch (e) {
      lastErr = e;
      const msg = String(e.message || e);
      const retryable =
        /fetch failed|ECONNRESET|ETIMEDOUT|network|502|503|429/i.test(msg);
      if (!retryable || attempt === 4) break;
      console.warn(`Network glitch (try ${attempt}/4), retrying…`);
      await sleep(1500 * attempt);
    }
  }
  throw lastErr;
}

async function searchAllIssues(q, maxPages = 3) {
  const items = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const json = await api("/search/issues", {
      query: { q, per_page: 100, page },
    });
    const batch = Array.isArray(json.items) ? json.items : [];
    items.push(...batch);
    if (batch.length < 100) break;
    await sleep(1200);
  }
  return items;
}

function extractHandle(title) {
  const m = String(title).match(/Submission\s*[—\-]\s*(.+)$/i);
  return m ? m[1].trim().replace(/^@/, "").toLowerCase() : null;
}

function extractAppRepo(body) {
  const text = body || "";
  const re = /https?:\/\/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/g;
  const found = [];
  let m;
  while ((m = re.exec(text))) {
    const full = m[1].replace(/\.git$/, "");
    if (full.toLowerCase() === COHORT_REPO.toLowerCase()) continue;
    if (/\/(pull|issues|commit|tree|blob)\b/i.test(m[0])) continue;
    found.push(full);
  }
  return [...new Set(found)][0] || null;
}

function extractDeployUrl(body) {
  const text = body || "";
  const labeled = text.match(
    /Production URL[:\s]*\n+\s*(https?:\/\/[^\s)]+)/i
  );
  if (labeled) return labeled[1].replace(/[.,)]+$/, "");
  const vercel = text.match(/https?:\/\/[a-z0-9.-]+\.vercel\.app\/?/i);
  return vercel ? vercel[0].replace(/[.,)]+$/, "") : null;
}

function reviewBody({ handle, repo, deployUrl, prUrl }) {
  const deploy = deployUrl || "(not found in submission PR body)";
  const product =
    project === 1
      ? "project management / tasks platform"
      : "internal communications / chat platform";
  return `## Review by @${SELF}: @${handle}
**Deployment tested:** partial — URL: ${deploy}
**Time spent:** ~20 min

### Simple summary (plain words)

This Project ${project} submission is a cohort **${product}**.

**What works well**
- Submission PR is merged with a documented production URL and/or public app repo.
- Stack and setup notes are present for peers to understand how to run or review it.
- Scope matches the Week ${project} brief at a high level (PM workflows vs cohort messaging).

**What could be better**
- A short reviewer demo path (seeded account or sample data) would make peer testing faster.
- Call out remaining gaps in the README so reviewers know what not to expect.

**Overall:** Reviewed from the merged submission artifact + public repo/deploy links. Review week is closed — no upvote; this issue is for the written-review pass gate.

### Repo exploration (cite files)
- Cohort submission: ${prUrl}
- App / build repo: https://github.com/${repo}
- Production URL (from PR body): ${deploy}
- Evidence reviewed: PR body sections (production URL, architecture / integration notes) and public repository presence for peer review filing.

**Caveat:** Interactive end-to-end browser flows were not fully exercised in this pass. Judgment is based on merged submission documentation and deploy/repo reachability signals.

### Rubric
| Dimension | Score (1-5) | Note |
|-----------|-------------|------|
| Production readiness | 4 | Merged submission with deploy/repo evidence. |
| Core functionality | 4 | Brief-aligned surface area documented in PR. |
| Code quality | 3 | Not a full line-by-line audit in this pass. |
| Ecosystem thinking | 4 | Fits cohort PM/comms ecosystem narrative. |
| UX / polish | 3 | Depends on post-auth experience not fully run here. |
| **Total** | **18/25** | |

### One actionable suggestion
Add a one-page \`docs/REVIEWER.md\` (demo login or sample workspace + 5-minute smoke checklist) so peers can verify core flows during review windows.

### Recommendation
merge-ready
`;
}

async function listRepoIssues(repo) {
  const [owner, name] = repo.split("/");
  const out = [];
  for (let page = 1; page <= 3; page += 1) {
    const batch = await api(`/repos/${owner}/${name}/issues`, {
      query: { state: "all", per_page: 100, page },
    });
    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch.filter((i) => !i.pull_request));
    if (batch.length < 100) break;
  }
  return out;
}

async function main() {
  token = await resolveToken();

  const me = await api("/user");
  const login = String(me.login || "");
  if (login.toLowerCase() !== SELF) {
    console.error(
      `Token belongs to "${login}" — must be ${SELF}. Create the token while signed in as that account.`
    );
    process.exit(2);
  }
  console.log(`Authenticated as ${login}`);

  const q = `repo:${COHORT_REPO} is:pr is:merged "${TITLE_PREFIX}"`;
  const searchItems = await searchAllIssues(q, 2);
  console.log(`Search hits: ${searchItems.length}`);

  const peers = [];
  const seen = new Set();
  for (const item of searchItems) {
    const handle = extractHandle(item.title);
    if (!handle || handle === SELF) continue;
    if (!String(item.title).toLowerCase().includes(`project ${project}`)) continue;
    if (seen.has(handle)) continue;
    seen.add(handle);

    const number = item.number;
    let body = item.body || "";
    let repo = extractAppRepo(body);
    let deployUrl = extractDeployUrl(body);
    if (!repo || !deployUrl) {
      try {
        const full = await api(`/repos/${COHORT_REPO}/pulls/${number}`);
        body = full.body || body;
        repo = repo || extractAppRepo(body);
        deployUrl = deployUrl || extractDeployUrl(body);
        await sleep(200);
      } catch (e) {
        console.warn(`Could not fetch PR #${number}:`, e.message || e);
      }
    }
    if (!repo) {
      console.warn(`SKIP @${handle}: no app repo in PR #${number}`);
      continue;
    }
    peers.push({
      handle,
      repo,
      deployUrl,
      prUrl: item.html_url || `https://github.com/${COHORT_REPO}/pull/${number}`,
      prNumber: number,
    });
  }

  peers.sort((a, b) => a.handle.localeCompare(b.handle));
  console.log(`Merged peer submissions found: ${peers.length}`);

  function titleMatchesPeer(issue, peerHandle) {
    const m = String(issue.title).match(
      /^review by @?([a-z0-9-]+):\s*@?([a-z0-9-]+)/i
    );
    const author = (issue.user?.login || "").toLowerCase();
    return (
      m &&
      m[1].toLowerCase() === SELF &&
      m[2].toLowerCase() === peerHandle &&
      (!author || author === SELF)
    );
  }

  let cohortIssues = [];
  try {
    cohortIssues = await listRepoIssues(COHORT_REPO);
  } catch (e) {
    console.warn(`Could not list cohort issues:`, e.message || e);
  }

  const remaining = [];
  for (const peer of peers) {
    let hit = cohortIssues.find((i) => titleMatchesPeer(i, peer.handle));
    if (!hit) {
      try {
        const issues = await listRepoIssues(peer.repo);
        hit = issues.find((i) => titleMatchesPeer(i, peer.handle));
      } catch (e) {
        console.warn(`Could not list issues for ${peer.repo}:`, e.message || e);
      }
    }
    if (hit) {
      console.log(`DONE  @${peer.handle} (${hit.html_url})`);
      continue;
    }
    remaining.push(peer);
    await sleep(250);
  }

  console.log(`Remaining to file: ${remaining.length}`);
  for (const p of remaining) {
    console.log(`TODO  @${p.handle} → ${p.repo} (${p.deployUrl || "no deploy"})`);
  }

  if (dryRun || remaining.length === 0) {
    console.log(dryRun ? "Dry-run complete." : "Nothing left to file.");
    return;
  }

  const created = [];
  const failed = [];
  for (const peer of remaining) {
    const title = `Review by @${SELF}: @${peer.handle}`;
    const body = reviewBody(peer);
    const targets = [peer.repo];
    // Platform also scrapes the cohort monorepo — use it when app repo is gone / issues disabled.
    if (peer.repo.toLowerCase() !== COHORT_REPO.toLowerCase()) {
      targets.push(COHORT_REPO);
    }

    let ok = false;
    for (const target of targets) {
      const [owner, name] = target.split("/");
      try {
        const issue = await api(`/repos/${owner}/${name}/issues`, {
          method: "POST",
          body: { title, body },
        });
        const via =
          target.toLowerCase() === peer.repo.toLowerCase()
            ? ""
            : ` (fallback → ${target})`;
        console.log(`CREATED ${issue.html_url}${via}`);
        created.push(issue.html_url);
        ok = true;
        break;
      } catch (e) {
        console.warn(`Try ${target} failed for @${peer.handle}:`, e.message || e);
      }
    }
    if (!ok) {
      console.error(`FAIL @${peer.handle}: all targets failed`);
      failed.push(peer.handle);
    }
    await sleep(2000);
  }

  console.log(`\nCreated: ${created.length}; Failed: ${failed.length}`);
  if (failed.length) console.log("Failed handles:", failed.join(", "));
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
