/**
 * Export CRM leads from local JSONL store (private — not for public repo).
 * Usage: npm run export-crm
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readCrmLeads } from '../src/lib/crm/store.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function main() {
  const leads = readCrmLeads();
  const outDir = path.join(root, 'data', 'crm');
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const outPath = path.join(outDir, `leads-export-${stamp}.json`);
  writeFileSync(outPath, JSON.stringify({ exported_at: new Date().toISOString(), count: leads.length, leads }, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({ count: leads.length, written: outPath }, null, 2));
}

main();
