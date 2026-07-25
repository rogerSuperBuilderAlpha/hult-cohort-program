#!/usr/bin/env node
/**
 * Contract-drift check (cross-app regression #1) — one command, fails on mismatch.
 *
 * The shared-context bus works only if Rally and Pulse agree on the contract. This runs BOTH
 * apps' behavioral golden tests (tests/unit/contract-golden.test.ts) — each pins the same exact
 * values (paths, handle normalization, task lifecycle) against its OWN copy of the contract. If
 * either app's contract drifts, its golden test fails and this exits non-zero.
 *
 * Behavioral, not textual: the two apps format the identical contract differently (multi-line vs
 * inline literals, trailing semicolons), so a source diff produces false positives. Comparing what
 * the contract DOES is formatting-immune and is what actually matters for interop.
 *
 * Usage (from the Pulse app dir):  node scripts/audit/contract-drift.mjs
 * Requires the sibling Rally checkout at ../nikjain15-project-2 (skipped with a warning if absent).
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PULSE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RALLY = resolve(PULSE, '..', 'nikjain15-project-2');
const GOLDEN = 'tests/unit/contract-golden.test.ts';

function runGolden(label, cwd) {
  if (!existsSync(resolve(cwd, GOLDEN))) {
    console.warn(`⚠  ${label}: ${GOLDEN} not found at ${cwd} — skipping (add it to guard drift).`);
    return null; // unknown, not a pass
  }
  try {
    execSync(`npx vitest run --project unit ${GOLDEN}`, { cwd, stdio: 'pipe' });
    console.log(`✓ ${label}: contract golden values match`);
    return true;
  } catch (e) {
    console.error(`✗ ${label}: contract golden test FAILED — the contract drifted.`);
    console.error((e.stdout?.toString() ?? '') + (e.stderr?.toString() ?? ''));
    return false;
  }
}

const pulse = runGolden('Pulse', PULSE);
const rally = runGolden('Rally', RALLY);

// Fail if either app's golden test failed. A skipped side (missing checkout) is a warning, not a
// pass — but doesn't fail the check on its own, so Pulse's CI can run it without Rally present.
if (pulse === false || rally === false) {
  console.error('\n✗ CONTRACT DRIFT DETECTED — Rally and Pulse no longer agree. Sharing is broken until fixed.');
  process.exit(1);
}
if (pulse === true && rally === true) {
  console.log('\n✓ Contract is identical across Rally and Pulse (behavioral golden match).');
} else {
  console.log('\n(One side was skipped; ran the checks that were available.)');
}
