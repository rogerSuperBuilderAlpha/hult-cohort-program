/**
 * Thin wrapper — prefer: npx tsx scripts/tally-votes.ts …
 * Kept so existing docs/scripts that call node scripts/tally-votes.mjs keep working.
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const result = spawnSync(
  'npx',
  ['--yes', 'tsx', path.join(__dirname, 'tally-votes.ts'), ...process.argv.slice(2)],
  { stdio: 'inherit', cwd: path.join(__dirname, '..'), env: process.env }
);
process.exit(result.status ?? 1);
