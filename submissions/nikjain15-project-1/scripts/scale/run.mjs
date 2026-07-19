#!/usr/bin/env node
/**
 * Pulse scale / load harness.
 *
 * Simulates a cohort of N synthetic members driving realistic board activity, then measures the
 * cost of the two read paths that grow with the cohort:
 *   1. Board load  — the tasks a screen subscribes to.
 *   2. Broker tick — lib/broker-admin.ts `gather()`, which today reads SIX whole collections
 *      (tasks, recipes, members, introductions, cohortMembers, githubLinks) on every run.
 *
 * It reports p50/p95/p99 latency and Firestore doc-read counts (the billing unit) at N = 100 /
 * 1k / 5k, and compares the broker's full-collection scan against a `stuckSince`-indexed query
 * (the proposed fix) so the bottleneck and its remedy are quantified, not guessed.
 *
 * SAFETY: refuses to run unless FIRESTORE_EMULATOR_HOST is set — it must NEVER touch a prod
 * project. All data uses synthetic `zz-test-*` handles and is deleted at the end of each N.
 *
 *   Run:  npm run test:scale        (wraps this in `firebase emulators:exec`)
 *   Or:   firebase emulators:exec --only firestore --project demo-pulse "node scripts/scale/run.mjs"
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('✗ REFUSING TO RUN: FIRESTORE_EMULATOR_HOST is not set.');
  console.error('  This harness writes thousands of docs and must only ever hit the emulator.');
  console.error('  Use:  npm run test:scale');
  process.exit(1);
}

initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? 'demo-pulse' });
const db = getFirestore();

const SIZES = (process.env.SCALE_SIZES ?? '100,1000,5000').split(',').map((n) => Number(n.trim()));
const TASKS_PER_MEMBER = 2;
const STUCK_RATE = 0.05; // ~5% of tasks carry an "I'm stuck" opt-in — the broker's real signal
const SAMPLES = 12; // repetitions per measurement, for percentiles

const pct = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};
const ms = (v) => `${v.toFixed(1)}ms`;

async function timeIt(fn) {
  const t0 = performance.now();
  const reads = await fn();
  return { dt: performance.now() - t0, reads };
}

async function seed(n) {
  // Batched writes (500/batch, Firestore's cap). Synthetic handles only.
  const collections = { members: [], tasks: [], recipes: [], cohortMembers: [], githubLinks: [], introductions: [] };
  for (let i = 0; i < n; i++) {
    const uid = `zz-test-uid-${i}`;
    const handle = `zz-test-h-${i}`;
    collections.members.push([`members/${uid}`, { uid, handle, displayName: `ZZ ${i}`, createdAt: Date.now() }]);
    collections.cohortMembers.push([`cohortMembers/${handle}`, { login: handle }]);
    collections.githubLinks.push([`githubLinks/${uid}`, { handle, narrationOptIn: false }]);
    for (let t = 0; t < TASKS_PER_MEMBER; t++) {
      const stuck = Math.random() < STUCK_RATE;
      collections.tasks.push([
        `tasks/zz-test-task-${i}-${t}`,
        { title: `Task ${i}-${t}`, status: t === 0 ? 'in_progress' : 'todo', creatorUid: uid, assigneeUid: uid,
          projectId: `zz-test-proj-${i % 20}`, stuckSince: stuck ? Date.now() : null, source: 'manual', dueDate: null },
      ]);
    }
    if (i % 10 === 0) collections.recipes.push([`recipes/zz-test-r-${i}`, { title: `Recipe ${i}`, authorHandle: handle }]);
  }
  let total = 0;
  for (const [, docs] of Object.entries(collections)) {
    for (let i = 0; i < docs.length; i += 500) {
      const batch = db.batch();
      for (const [path, data] of docs.slice(i, i + 500)) batch.set(db.doc(path), data);
      await batch.commit();
      total += Math.min(500, docs.length - i);
    }
  }
  return total;
}

// The broker's real gather(): six full-collection reads.
async function brokerGatherFull() {
  const snaps = await Promise.all([
    db.collection('tasks').get(),
    db.collection('recipes').get(),
    db.collection('members').get(),
    db.collection('introductions').get(),
    db.collection('cohortMembers').get(),
    db.collection('githubLinks').get(),
  ]);
  return snaps.reduce((a, s) => a + s.size, 0);
}

// The proposed fix for the sharpest cost: read only the stuck tasks via an index, not all tasks.
async function brokerGatherIndexed() {
  const snaps = await Promise.all([
    db.collection('tasks').where('stuckSince', '>', 0).get(), // needs a stuckSince index
    db.collection('recipes').get(),
    db.collection('members').get(),
    db.collection('introductions').get(),
    db.collection('cohortMembers').get(),
    db.collection('githubLinks').get(),
  ]);
  return snaps.reduce((a, s) => a + s.size, 0);
}

// A board load: the tasks for one project (what a project screen subscribes to).
async function boardLoad() {
  const snap = await db.collection('tasks').where('projectId', '==', 'zz-test-proj-0').get();
  return snap.size;
}

async function clearAll() {
  for (const c of ['members', 'tasks', 'recipes', 'cohortMembers', 'githubLinks', 'introductions']) {
    while (true) {
      const snap = await db.collection(c).limit(500).get();
      if (snap.empty) break;
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }
}

function summarize(name, samples, readsPerRun) {
  const p50 = pct(samples, 50), p95 = pct(samples, 95), p99 = pct(samples, 99);
  console.log(`    ${name.padEnd(22)} reads/run=${String(readsPerRun).padStart(6)}  p50=${ms(p50).padStart(8)}  p95=${ms(p95).padStart(8)}  p99=${ms(p99).padStart(8)}`);
  return { p50, p95, p99, readsPerRun };
}

const report = [];
for (const n of SIZES) {
  console.log(`\n=== N = ${n} members (${n * TASKS_PER_MEMBER} tasks) ===`);
  await clearAll();
  const seeded = await seed(n);
  console.log(`  seeded ${seeded} docs`);

  const runs = { full: [], indexed: [], board: [] };
  let fullReads = 0, idxReads = 0, boardReads = 0;
  for (let s = 0; s < SAMPLES; s++) {
    const a = await timeIt(brokerGatherFull); runs.full.push(a.dt); fullReads = a.reads;
    const b = await timeIt(brokerGatherIndexed); runs.indexed.push(b.dt); idxReads = b.reads;
    const c = await timeIt(boardLoad); runs.board.push(c.dt); boardReads = c.reads;
  }
  console.log(`  Firestore reads (the billing unit) + latency percentiles over ${SAMPLES} runs:`);
  const full = summarize('broker gather (FULL)', runs.full, fullReads);
  const idx = summarize('broker gather (indexed)', runs.indexed, idxReads);
  const board = summarize('board load (1 project)', runs.board, boardReads);
  const saved = fullReads - idxReads;
  console.log(`  → indexed broker tick reads ${saved} fewer docs (${((saved / fullReads) * 100).toFixed(0)}% cheaper) at this size`);
  report.push({ n, full, indexed: idx, board, savedReads: saved });
}

await clearAll();
console.log('\n=== SUMMARY (Firestore doc-reads per broker tick) ===');
for (const r of report) {
  console.log(`  N=${String(r.n).padStart(4)}: FULL=${r.full.readsPerRun} reads (p95 ${ms(r.full.p95)}) → INDEXED=${r.indexed.readsPerRun} reads (p95 ${ms(r.indexed.p95)})  | board-load p95 ${ms(r.board.p95)}`);
}
console.log('\nBottleneck: broker gather() reads whole collections; the tasks scan dominates and grows O(all tasks).');
console.log('Fix: a stuckSince index turns the tasks read into O(stuck tasks). Numbers above quantify the win.');
console.log('Done. All zz-test-* data deleted.');
process.exit(0);
