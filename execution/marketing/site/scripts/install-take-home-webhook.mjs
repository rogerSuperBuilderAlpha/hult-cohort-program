/**
 * Install (or update) the GitHub webhook on the admissions take-home repo.
 *
 * Usage (from execution/marketing/site):
 *   GITHUB_WEBHOOK_SECRET=... node scripts/install-take-home-webhook.mjs [--dry-run]
 *
 * Requires `gh` CLI authenticated with admin on the take-home repo.
 */

import { execFileSync } from 'child_process';
import { siteUrl } from '../lib/site-url.mjs';

const DEFAULT_TAKE_HOME_REPO_URL =
  'https://github.com/rogerSuperBuilderAlpha/admissions-task-board-fall26';

function takeHomeRepoFullName() {
  const url = process.env.NEXT_PUBLIC_TAKE_HOME_REPO_URL?.trim() || DEFAULT_TAKE_HOME_REPO_URL;
  try {
    const u = new URL(url);
    const match = u.pathname.match(/^\/([^/]+\/[^/]+)\/?$/);
    if (match) return match[1];
  } catch {
    // fall through
  }
  return 'rogerSuperBuilderAlpha/admissions-task-board-fall26';
}

const dryRun = process.argv.includes('--dry-run');
const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();
const webhookUrl = `${siteUrl()}/api/github/webhook`;
const repo = takeHomeRepoFullName();

if (!secret) {
  console.error('Set GITHUB_WEBHOOK_SECRET (must match Vercel production).');
  process.exit(1);
}

function ghApi(method, endpoint, body) {
  const args = ['api', '--method', method, endpoint];
  if (body) {
    args.push('--input', '-');
  }
  const out = execFileSync('gh', args, {
    encoding: 'utf8',
    input: body ? JSON.stringify(body) : undefined,
  });
  return out.trim() ? JSON.parse(out) : null;
}

const hookBody = {
  name: 'web',
  active: true,
  events: ['pull_request'],
  config: {
    url: webhookUrl,
    content_type: 'json',
    secret,
    insecure_ssl: '0',
  },
};

console.log(`Take-home repo: ${repo}`);
console.log(`Webhook URL: ${webhookUrl}`);

const hooks = ghApi('GET', `/repos/${repo}/hooks`);
const existing = hooks.find((h) => h.config?.url === webhookUrl);

if (dryRun) {
  console.log(existing ? 'Would PATCH existing hook' : 'Would POST new hook');
  console.log(JSON.stringify(hookBody, null, 2));
  process.exit(0);
}

if (existing) {
  ghApi('PATCH', `/repos/${repo}/hooks/${existing.id}`, hookBody);
  console.log(`Updated webhook hook id=${existing.id}`);
} else {
  const created = ghApi('POST', `/repos/${repo}/hooks`, hookBody);
  console.log(`Created webhook hook id=${created?.id ?? 'unknown'}`);
}
