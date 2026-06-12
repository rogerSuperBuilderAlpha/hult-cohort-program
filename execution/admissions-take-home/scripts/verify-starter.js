/**
 * CI guard: starter must have 3 failing tests (Bug 1 getTasks, Bug 2 updateTask, Bug 3 PATCH).
 * Applicant PRs run `npm test` and must be fully green.
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

for (const name of [
  'getTasks returns a copy',
  'updateTask merges patch without dropping fields',
  'marks a task complete via PATCH',
]) {
  if (!out.includes(name)) {
    console.error(`verify-starter: expected failing test "${name}"`);
    process.exit(1);
  }
}

if (!/pass 1/.test(out) || !/fail 3/.test(out)) {
  console.error('verify-starter: expected 1 passing and 3 failing tests');
  process.exit(1);
}

console.log('verify-starter: starter state OK (3 intentional failures)');
