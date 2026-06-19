import { cohortIdFromEnv } from './firebase-admin.mjs';

export function arg(name, argv = process.argv.slice(2)) {
  const prefix = `--${name}=`;
  const hit = argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

export function hasFlag(name, argv = process.argv.slice(2)) {
  return argv.includes(`--${name}`);
}

export function confirmFlag(argv = process.argv.slice(2)) {
  return hasFlag('confirm', argv);
}

export function cohortId() {
  return cohortIdFromEnv();
}
