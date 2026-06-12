/**
 * CI guard: starter repo must have exactly one failing test (Bug 1 — getTasks).
 * Applicant PRs run `npm test` directly and must be fully green.
 */
import { spawnSync } from 'node:child_process';

const result = spawnSync('node', ['--test', 'tests/tasks.test.js', 'tests/server.test.js'], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
});

const out = `${result.stdout ?? ''}${result.stderr ?? ''}`;
process.stdout.write(result.stdout ?? '');
process.stderr.write(result.stderr ?? '');

if (result.status !== 1) {
  console.error(`verify-starter: expected exit code 1, got ${result.status ?? 'null'}`);
  process.exit(1);
}

if (!out.includes('getTasks returns a copy')) {
  console.error('verify-starter: expected getTasks copy test to fail');
  process.exit(1);
}

if (!/pass 3/.test(out) || !/fail 1/.test(out)) {
  console.error('verify-starter: expected 3 passing and 1 failing test');
  process.exit(1);
}

console.log('verify-starter: starter state OK (1 intentional failure)');
