#!/usr/bin/env node
/**
 * Rally synthetic scale harness (emulator-only).
 *
 * Simulates a whole cohort (and beyond) talking at once, then measures where Rally breaks FIRST.
 * It provisions N synthetic users + channels, drives a concurrent write workload, and times the
 * hot read paths that back Rally's screens — replicating the EXACT Firestore queries in
 * lib/*-admin.ts and lib/data.ts (source pointers on each probe) so the numbers reflect real code.
 *
 * The single most important scale signal here is DOCS READ PER CALL: the emulator is one process
 * and not a faithful latency model of production Firestore, but the number of documents a query
 * touches is exactly what production bills and what determines whether a read scales. A probe whose
 * docs-read grows with total cohort activity (not with the caller's own data) is an unbounded read.
 *
 * Run:
 *   npm run emulator            # terminal 1
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=demo-rally \
 *     SCALE_USERS=1000 node scripts/scale/harness.mjs
 *
 * Guardrail #1: refuses to run unless FIRESTORE_EMULATOR_HOST is set (see config.mjs).
 */
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { CONFIG, assertEmulator } from './config.mjs';

assertEmulator();
if (!getApps().length) initializeApp({ projectId: CONFIG.project });
const db = getFirestore();

// ---- tiny utils -----------------------------------------------------------
const now = () => Number(process.hrtime.bigint() / 1000n) / 1000; // ms, monotonic
function pct(sorted, p) {
  if (!sorted.length) return 0;
  const i = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[i];
}
function stats(samples) {
  const s = [...samples].sort((a, b) => a - b);
  return {
    n: s.length,
    p50: +pct(s, 50).toFixed(2),
    p95: +pct(s, 95).toFixed(2),
    p99: +pct(s, 99).toFixed(2),
    max: +(s[s.length - 1] ?? 0).toFixed(2),
  };
}
/** Run `tasks` thunks with a bounded concurrency. */
async function pool(tasks, limit) {
  const results = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  });
  if (workers.length) await Promise.all(workers);
  return results;
}
const uidOf = (n) => `su_${String(n).padStart(6, '0')}`;
const chIdOf = (n) => `sc_${String(n).padStart(4, '0')}`;

// ---- provision ------------------------------------------------------------
async function provision() {
  const t0 = now();
  const { users, channels, channelsPerUser, messagesPerUser, recognitionRate } = CONFIG;

  // Profiles.
  await pool(
    Array.from({ length: users }, (_, n) => async () => {
      await db.collection('profiles').doc(uidOf(n)).set({
        uid: uidOf(n), handle: `user${n}`, githubLogin: `user${n}`,
        displayName: `Synthetic User ${n}`, avatarUrl: null, createdAt: Date.now(),
      });
    }),
    CONFIG.writeConcurrency,
  );

  // Channels — each gets a deterministic slice of members (fan-out = users*channelsPerUser/channels).
  const memberByChannel = Array.from({ length: channels }, () => []);
  for (let n = 0; n < users; n++) {
    for (let k = 0; k < channelsPerUser; k++) memberByChannel[(n + k) % channels].push(uidOf(n));
  }
  await pool(
    Array.from({ length: channels }, (_, c) => async () => {
      await db.collection('channels').doc(chIdOf(c)).set({
        slug: `chan-${c}`, name: `Channel ${c}`, kind: 'channel', isPrivate: false,
        creatorUid: memberByChannel[c][0] ?? uidOf(0), memberUids: memberByChannel[c], createdAt: Date.now(),
      });
    }),
    CONFIG.writeConcurrency,
  );

  // Backfill messages + xpEvents + recognitions. xpEvents is the collection whose growth the
  // leaderboard scan pays for — recognitionRate controls how fast it grows per message.
  let xpCount = 0;
  const writeTasks = [];
  for (let n = 0; n < users; n++) {
    // seed XP per user (mirrors seed.mjs xpEvents rows)
    writeTasks.push(async () => {
      await db.collection('xpEvents').doc(`seed_${uidOf(n)}`).set({
        profileUid: uidOf(n), source: 'seed', refId: 'scale', points: (n % 40) + 1, createdAt: Date.now(),
      });
    });
    xpCount++;
    for (let m = 0; m < messagesPerUser; m++) {
      const c = (n + m) % channels;
      const msgId = `m_${n}_${m}`;
      writeTasks.push(async () => {
        await db.collection('channels').doc(chIdOf(c)).collection('messages').doc(msgId).set({
          authorUid: uidOf(n), body: `msg ${m} from user ${n} — lorem ipsum dolor sit amet`,
          parentId: m % 5 === 0 && m > 0 ? `m_${n}_${m - 1}` : null,
          reactions: {}, createdAt: new Date(Date.now() - (messagesPerUser - m) * 1000), editedAt: null,
        });
      });
      if (Math.random() < recognitionRate) {
        const helped = uidOf((n + 1) % users);
        const rid = `rec_${n}_${m}`;
        writeTasks.push(async () => {
          // a CONFIRMED recognition => 2 xpEvents (helper + thanks) + a pulse row. This is the
          // realistic driver of xpEvents growth (see lib/recognition-admin.ts confirmRecognition).
          await db.collection('recognitions').doc(rid).set({
            helperUid: uidOf(n), helpedUid: helped, kind: 'answered', status: 'confirmed',
            points: 8, sourceMsgRef: `channels/${chIdOf(c)}/messages/${msgId}`, createdAt: Date.now(),
          });
          await db.collection('xpEvents').doc(`xp_help_${rid}`).set({
            profileUid: uidOf(n), source: 'recognition', refId: rid, points: 8, createdAt: Date.now(),
          });
          await db.collection('xpEvents').doc(`xp_thanks_${rid}`).set({
            profileUid: helped, source: 'recognition_confirmed', refId: rid, points: 2, createdAt: Date.now(),
          });
        });
        xpCount += 2;
      }
    }
    // a read bookmark for the brief probe (half the users have one; half are "brand new")
    if (n % 2 === 0) {
      const c = n % channels;
      writeTasks.push(async () => {
        await db.collection('channels').doc(chIdOf(c)).collection('reads').doc(uidOf(n)).set({
          lastReadAt: new Date(Date.now() - 3600_000),
        });
      });
    }
  }
  await pool(writeTasks, CONFIG.writeConcurrency);

  return { provisionMs: +(now() - t0).toFixed(0), approxXpEvents: xpCount };
}

// ---- live write workload --------------------------------------------------
async function workload() {
  const { concurrentWriters, holdSeconds, postsPerWriterPerSecond, channels, users } = CONFIG;
  const latencies = [];
  let posts = 0, errors = 0;
  const gapMs = 1000 / postsPerWriterPerSecond;
  const deadline = Date.now() + holdSeconds * 1000;

  async function writer(w) {
    let seq = 0;
    while (Date.now() < deadline) {
      const n = (w * 7 + seq * 13) % users;
      const c = (w + seq) % channels;
      const t = now();
      try {
        await db.collection('channels').doc(chIdOf(c)).collection('messages').add({
          authorUid: uidOf(n), body: `live post w${w} #${seq}`, parentId: null,
          reactions: {}, createdAt: new Date(), editedAt: null,
        });
        latencies.push(now() - t);
        posts++;
      } catch {
        errors++;
      }
      seq++;
      const sleep = gapMs - (now() - t);
      if (sleep > 0) await new Promise((r) => setTimeout(r, sleep));
    }
  }
  const t0 = now();
  await Promise.all(Array.from({ length: concurrentWriters }, (_, w) => writer(w)));
  const wallSec = (now() - t0) / 1000;
  return { postLatencyMs: stats(latencies), posts, errors, throughputPerSec: +(posts / wallSec).toFixed(1) };
}

// ---- hot-doc contention: concurrent channel joins on ONE channel ----------
async function joinContention() {
  // Mirrors the client join transaction (togglesOnlySelf on channels/{id}.memberUids). A single
  // channel doc is a hot document — every joiner contends on the same doc. Measures retry/latency.
  const chId = chIdOf(0);
  const joiners = Math.min(80, CONFIG.users);
  const latencies = [];
  let ok = 0, fail = 0;
  await Promise.all(
    Array.from({ length: joiners }, (_, j) => async () => {
      const uid = `joiner_${j}`;
      const t = now();
      try {
        await db.runTransaction(async (tx) => {
          const ref = db.collection('channels').doc(chId);
          const snap = await tx.get(ref);
          const members = snap.data()?.memberUids ?? [];
          if (!members.includes(uid)) tx.update(ref, { memberUids: [...members, uid] });
        });
        latencies.push(now() - t);
        ok++;
      } catch {
        fail++;
      }
    }).map((f) => f()),
  );
  return { joiners, ok, fail, joinLatencyMs: stats(latencies) };
}

// ---- probes: time + docs-read for the hot read paths ----------------------
async function timed(fn, iters) {
  const times = [];
  let docsRead = 0;
  for (let i = 0; i < iters; i++) {
    const t = now();
    docsRead = await fn(i);
    times.push(now() - t);
  }
  return { latencyMs: stats(times), docsReadPerCall: docsRead };
}

async function probes() {
  const { probeIterations: it, users, channels } = CONFIG;
  const sampleUid = (i) => uidOf((i * 37) % users);

  // 1) LEADERBOARD — lib/leaderboard-admin.ts computeLeaderboard: reads the ENTIRE xpEvents
  //    collection every call. docsRead grows with TOTAL cohort activity, not the caller.
  const leaderboard = await timed(async () => {
    const snap = await db.collection('xpEvents').get();
    const totals = new Map();
    for (const d of snap.docs) totals.set(d.data().profileUid, (totals.get(d.data().profileUid) ?? 0) + (d.data().points ?? 0));
    [...totals.entries()].sort((a, b) => b[1] - a[1]);
    return snap.size;
  }, it);

  // 2) BRIEF gather — lib/brief-admin.ts gatherBriefInput: recognitions + commitments + channels
  //    (array-contains), then per-channel reads doc + messages(limit 50). Bounded by the caller's
  //    OWN membership; docsRead scales with channelsPerUser, not the cohort.
  const brief = await timed(async (i) => {
    const uid = sampleUid(i);
    let read = 0;
    const [recs, commits, chans] = await Promise.all([
      db.collection('recognitions').where('helpedUid', '==', uid).where('status', '==', 'suggested').get(),
      db.collection('commitments').where('authorUid', '==', uid).where('status', '==', 'open').get(),
      db.collection('channels').where('memberUids', 'array-contains', uid).get(),
    ]);
    read += recs.size + commits.size + chans.size;
    await Promise.all(chans.docs.map(async (ch) => {
      const r = await db.collection('channels').doc(ch.id).collection('reads').doc(uid).get();
      read += r.exists ? 1 : 0;
      const lastRead = r.exists ? (r.data()?.lastReadAt?.toMillis?.() ?? 0) : 0;
      const msgs = await db.collection('channels').doc(ch.id).collection('messages')
        .where('createdAt', '>', new Date(lastRead)).limit(50).get();
      read += msgs.size;
    }));
    return read;
  }, it);

  // 3) CHANNEL PAGE LOAD — lib/data.ts subscribeMessages: orderBy desc limit(max=100). Bounded.
  const channelPage = await timed(async (i) => {
    const c = i % channels;
    const snap = await db.collection('channels').doc(chIdOf(c)).collection('messages')
      .orderBy('createdAt', 'desc').limit(100).get();
    return snap.size;
  }, it);

  // 4) find_teammate — lib/assistant-admin.ts: profiles.limit(200) full scan (client-filtered).
  const findTeammate = await timed(async () => {
    const snap = await db.collection('profiles').limit(200).get();
    return snap.size;
  }, it);

  // 5) summarize_channel — profiles.limit(300) names map + messages desc limit(80).
  const summarize = await timed(async (i) => {
    const c = i % channels;
    const names = await db.collection('profiles').limit(300).get();
    const msgs = await db.collection('channels').doc(chIdOf(c)).collection('messages')
      .orderBy('createdAt', 'desc').limit(80).get();
    return names.size + msgs.size;
  }, it);

  return { leaderboard, brief, channelPage, findTeammate, summarize };
}

// ---- listener delivery latency (post -> onSnapshot) -----------------------
async function listenerLatency() {
  const chId = chIdOf(1);
  const samples = [];
  const pending = new Map();
  const unsub = db.collection('channels').doc(chId).collection('messages')
    .orderBy('createdAt', 'desc').limit(100)
    .onSnapshot((snap) => {
      const t = now();
      for (const ch of snap.docChanges()) {
        if (ch.type === 'added') {
          const marker = ch.doc.data().marker;
          if (marker && pending.has(marker)) { samples.push(t - pending.get(marker)); pending.delete(marker); }
        }
      }
    });
  await new Promise((r) => setTimeout(r, 300)); // let initial snapshot settle
  for (let i = 0; i < 30; i++) {
    const marker = `mk_${i}_${now()}`;
    pending.set(marker, now());
    await db.collection('channels').doc(chId).collection('messages').add({
      authorUid: uidOf(0), body: `latency probe ${i}`, marker, parentId: null, reactions: {}, createdAt: new Date(),
    });
    await new Promise((r) => setTimeout(r, 60));
  }
  await new Promise((r) => setTimeout(r, 500));
  unsub();
  return { deliveryLatencyMs: stats(samples), delivered: samples.length };
}

// ---- main -----------------------------------------------------------------
async function main() {
  const started = new Date().toISOString();
  console.error(`[scale] users=${CONFIG.users} channels=${CONFIG.channels} — provisioning...`);
  const provisionResult = await provision();
  console.error(`[scale] provisioned in ${provisionResult.provisionMs}ms (~${provisionResult.approxXpEvents} xpEvents). workload...`);
  const workloadResult = await workload();
  console.error(`[scale] workload done (${workloadResult.posts} posts). contention...`);
  const contention = await joinContention();
  console.error('[scale] probing hot read paths...');
  const probeResults = await probes();
  console.error('[scale] measuring listener latency...');
  const listener = await listenerLatency();

  const report = {
    startedAt: started,
    config: {
      users: CONFIG.users, channels: CONFIG.channels, channelsPerUser: CONFIG.channelsPerUser,
      messagesPerUser: CONFIG.messagesPerUser, recognitionRate: CONFIG.recognitionRate,
      concurrentWriters: CONFIG.concurrentWriters, holdSeconds: CONFIG.holdSeconds,
    },
    provision: provisionResult,
    workload: workloadResult,
    joinContention: contention,
    probes: probeResults,
    listener,
  };
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

main().catch((e) => { console.error('[scale] FAILED:', e); process.exit(1); });
