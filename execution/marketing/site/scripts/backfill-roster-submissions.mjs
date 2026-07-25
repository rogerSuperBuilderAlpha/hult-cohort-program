/**
 * @deprecated Demo-only backfill. Prefer: node scripts/reconcile-submissions.mjs --write-cache
 * Usage: node scripts/backfill-roster-submissions.mjs
 */

console.warn(
  'backfill-roster-submissions.mjs is deprecated — it fabricated PR rows.\n' +
    'Use: node scripts/reconcile-submissions.mjs [--write-cache]'
);
process.exit(1);
