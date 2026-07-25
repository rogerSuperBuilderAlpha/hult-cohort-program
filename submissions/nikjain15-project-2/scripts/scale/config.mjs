/**
 * Scale-harness configuration. Every knob is overridable by an env var so the same harness runs
 * at 100, 1k, and 5k without edits:
 *
 *   SCALE_USERS=1000 SCALE_CHANNELS=12 node scripts/scale/harness.mjs
 *
 * The harness ONLY ever talks to the Firestore emulator (guardrail #1: synthetic data, never prod).
 * It refuses to run unless FIRESTORE_EMULATOR_HOST is set, so it can never point at rally-14e17.
 */

const int = (name, dflt) => {
  const v = process.env[name];
  const n = v == null ? dflt : Number(v);
  if (!Number.isFinite(n)) throw new Error(`${name} must be a number, got ${v}`);
  return n;
};

export const CONFIG = {
  // Scale knobs.
  users: int('SCALE_USERS', 100),
  channels: int('SCALE_CHANNELS', 10),
  // How many channels each synthetic user joins (membership fan-out; drives array-contains + brief).
  channelsPerUser: int('SCALE_CHANNELS_PER_USER', 4),
  // Messages posted per user during the provision/backfill phase (builds channel history + xpEvents).
  messagesPerUser: int('SCALE_MESSAGES_PER_USER', 8),
  // Fraction of messages that also generate a confirmed recognition (=> 2 xpEvents each). This is
  // what makes xpEvents grow super-linearly with a chatty cohort — the leaderboard's scan cost.
  recognitionRate: Number(process.env.SCALE_RECOGNITION_RATE ?? 0.5),

  // Live workload (the "hold" phase): concurrent virtual users posting/reacting at a rate.
  concurrentWriters: int('SCALE_WRITERS', 50),
  holdSeconds: int('SCALE_HOLD_SECONDS', 8),
  postsPerWriterPerSecond: Number(process.env.SCALE_POST_RATE ?? 2),

  // How many probe iterations to time each hot read path (leaderboard/brief/etc.).
  probeIterations: int('SCALE_PROBE_ITERS', 20),

  // Concurrency ceiling for provisioning writes (emulator is single-process; keep it civil).
  writeConcurrency: int('SCALE_WRITE_CONCURRENCY', 64),

  project: process.env.GCLOUD_PROJECT || 'demo-rally',
  emulatorHost: process.env.FIRESTORE_EMULATOR_HOST || '',
};

export function assertEmulator() {
  if (!CONFIG.emulatorHost) {
    console.error(
      '\n[scale] REFUSING TO RUN: FIRESTORE_EMULATOR_HOST is not set.\n' +
        'This harness is synthetic-load only and must never touch a real project.\n' +
        'Start the emulator (npm run emulator) and run with:\n' +
        '  FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=demo-rally node scripts/scale/harness.mjs\n',
    );
    process.exit(2);
  }
  if (/rally-14e17|prod/i.test(CONFIG.project)) {
    console.error(`[scale] REFUSING TO RUN against project "${CONFIG.project}" — looks like prod.`);
    process.exit(2);
  }
}
