import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * UI VOICE GUARDRAIL — Rally is never called "AI" in the UI.
 *
 * The locked design (see MEMORY: Rally concept) says the assistant is ALWAYS "Rally", never
 * "AI". This mirrors the shell guardrail `grep -rniE "\bA\.?I\b" app/ components/` being empty:
 * no source under app/ or components/ may contain the word "AI" as a token (also matching the
 * "A.I." spelling), case-insensitive. Plus a couple of positive checks that the app does name the
 * assistant "Rally".
 */

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
// Matches "AI", "ai", "A.I.", "a.i" as a standalone token — the same shape as the shell guardrail.
const AI_TOKEN = /\bA\.?I\.?\b/i;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const appFiles = walk(path.join(repoRoot, 'app'));
const componentFiles = walk(path.join(repoRoot, 'components'));
const allFiles = [...appFiles, ...componentFiles];

describe('UI voice — the assistant is never called "AI"', () => {
  it('walks a non-empty set of source files under app/ and components/', () => {
    expect(appFiles.length).toBeGreaterThan(0);
    expect(componentFiles.length).toBeGreaterThan(0);
  });

  it('no file under app/ contains the "AI" token', () => {
    const offenders: string[] = [];
    for (const f of appFiles) {
      if (AI_TOKEN.test(readFileSync(f, 'utf8'))) offenders.push(path.relative(repoRoot, f));
    }
    expect(offenders).toEqual([]);
  });

  it('no file under components/ contains the "AI" token', () => {
    const offenders: string[] = [];
    for (const f of componentFiles) {
      if (AI_TOKEN.test(readFileSync(f, 'utf8'))) offenders.push(path.relative(repoRoot, f));
    }
    expect(offenders).toEqual([]);
  });

  it('no source file anywhere under app/ or components/ contains the "AI" token', () => {
    const offenders = allFiles.filter((f) => AI_TOKEN.test(readFileSync(f, 'utf8')));
    expect(offenders.map((f) => path.relative(repoRoot, f))).toEqual([]);
  });

  it('matches the shell guardrail: line-level scan finds zero "AI" hits', () => {
    let hits = 0;
    for (const f of allFiles) {
      for (const line of readFileSync(f, 'utf8').split('\n')) {
        if (AI_TOKEN.test(line)) hits++;
      }
    }
    expect(hits).toBe(0);
  });

  it('the AI_TOKEN regex actually catches the spellings it should (sanity)', () => {
    expect(AI_TOKEN.test('powered by AI')).toBe(true);
    expect(AI_TOKEN.test('an a.i. assistant')).toBe(true);
    expect(AI_TOKEN.test('ai')).toBe(true);
    // Must NOT match "AI" embedded inside another word like "aisle" or "chain".
    expect(AI_TOKEN.test('aisle')).toBe(false);
    expect(AI_TOKEN.test('chain')).toBe(false);
  });
});

describe('UI voice — the assistant is named "Rally"', () => {
  it('the nav brands the app as "Rally"', () => {
    const nav = readFileSync(path.join(repoRoot, 'components/rally-nav.tsx'), 'utf8');
    expect(nav).toContain('Rally');
  });

  it('"Rally" appears across the app/ surface, not just one file', () => {
    const rallyFiles = appFiles.filter((f) => readFileSync(f, 'utf8').includes('Rally'));
    expect(rallyFiles.length).toBeGreaterThan(1);
  });
});
