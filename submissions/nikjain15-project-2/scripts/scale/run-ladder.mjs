#!/usr/bin/env node
/**
 * Runs the scale harness across a ladder of user counts, wiping the emulator between each rung so
 * one run's leftover data never inflates the next. Emulator-only (same guardrail as the harness).
 *
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=demo-rally \
 *     node scripts/scale/run-ladder.mjs 100 1000 5000
 *
 * Writes each rung's JSON to scripts/scale/results/scale-<N>.json and prints a compact table.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const HOST = process.env.FIRESTORE_EMULATOR_HOST;
const PROJECT = process.env.GCLOUD_PROJECT || 'demo-rally';
if (!HOST) { console.error('Set FIRESTORE_EMULATOR_HOST (emulator only).'); process.exit(2); }

const rungs = (process.argv.slice(2).length ? process.argv.slice(2) : ['100', '1000']).map(Number);

async function wipe() {
  const url = `http://${HOST}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`wipe failed: ${res.status}`);
}

// Channel/message sizing per rung so bigger cohorts also get proportionally more channels.
function envFor(n) {
  const channels = Math.max(6, Math.round(n / 60));
  return {
    ...process.env,
    SCALE_USERS: String(n),
    SCALE_CHANNELS: String(channels),
    SCALE_CHANNELS_PER_USER: '4',
    SCALE_MESSAGES_PER_USER: '8',
    SCALE_RECOGNITION_RATE: '0.5',
    SCALE_WRITERS: String(Math.min(80, Math.max(20, Math.round(n / 20)))),
    SCALE_HOLD_SECONDS: '6',
  };
}

const outDir = join(HERE, 'results');
mkdirSync(outDir, { recursive: true });
const summary = [];

for (const n of rungs) {
  console.error(`\n=== RUNG: ${n} users — wiping emulator ===`);
  await wipe();
  const r = spawnSync('node', [join(HERE, 'harness.mjs')], { env: envFor(n), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) { console.error(r.stderr); throw new Error(`rung ${n} failed`); }
  const report = JSON.parse(r.stdout);
  writeFileSync(join(outDir, `scale-${n}.json`), JSON.stringify(report, null, 2));
  summary.push({
    users: n,
    provisionMs: report.provision.provisionMs,
    xpEvents: report.provision.approxXpEvents,
    postP95: report.workload.postLatencyMs.p95,
    throughput: report.workload.throughputPerSec,
    lbDocsRead: report.probes.leaderboard.docsReadPerCall,
    lbP95: report.probes.leaderboard.latencyMs.p95,
    briefDocsRead: report.probes.brief.docsReadPerCall,
    joinP95: report.joinContention.joinLatencyMs.p95,
    listenerP95: report.listener.deliveryLatencyMs.p95,
  });
  console.error(`=== RUNG ${n} done: leaderboard reads ${report.probes.leaderboard.docsReadPerCall} docs/call ===`);
}

console.log('\n=== LADDER SUMMARY ===');
console.log(JSON.stringify(summary, null, 2));
writeFileSync(join(outDir, 'ladder-summary.json'), JSON.stringify(summary, null, 2));
