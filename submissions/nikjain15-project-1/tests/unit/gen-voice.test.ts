import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * VOICE COMPLIANCE, ENFORCED AS A TEST.
 *
 * VOICE.md is the product's register. Three of its rules are mechanical enough to lint, so a
 * regression can't slip through review on vibes:
 *
 *   - Rule 3: "Zero exclamation marks, zero emoji." Excitement comes from specificity.
 *   - The pitch: the tagline is "the board that updates itself" — on the hero AND the tab title.
 *   - The pitch: never reintroduce "heartbeat" ("cohort's heartbeat" was the v1 line VOICE killed).
 *
 * The hard part is scanning only USER-FACING copy. A naive grep for "!" trips on `!==`, `!handle`,
 * and `!important`; a naive scan for emoji trips on the typographic glyphs this UI leans on (· — …
 * ▴ ▾ ⋯ ’). So we parse each .tsx with the TypeScript compiler and collect exactly the nodes a user
 * reads: JSX text, string/template literals rendered as JSX children, a whitelist of prose-bearing
 * attributes/props, and the `metadata` title/description (the browser tab). Code — className, href,
 * ids, comparison operators — and comments are structurally excluded by the AST, not by a regex.
 *
 * Because a lint-as-test is worthless if it silently scans nothing, the first block asserts the
 * scanner actually captured real, known prose and rejected real code, and the detectors are proven
 * non-vacuous against live samples before we trust their negatives.
 */

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const DIRS = ['components', 'app'];

/** Attributes/props that carry sentences a user reads (not machine values, hrefs, or SVG geometry). */
const PROSE_ATTRS = new Set([
  'title',
  'alt',
  'placeholder',
  'aria-label',
  'aria-description',
  'label',
  'hint',
  'headline',
  'description',
  'status',
]);

/** Elements whose text is code, not copy — CSS legitimately uses "!important". */
const SKIP_ELEMENTS = new Set(['style', 'script']);

const NAMED_ENTITIES: Record<string, string> = {
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  middot: '·',
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

/** Decode the HTML entities that appear literally in JSX text so we lint the *rendered* string. */
function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, g: string) => {
    if (g[0] === '#') {
      const code = g[1] === 'x' || g[1] === 'X' ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return NAMED_ENTITIES[g] ?? m;
  });
}

function listTsxFiles(): string[] {
  const files: string[] = [];
  for (const dir of DIRS) {
    let entries: string[];
    try {
      entries = readdirSync(new URL(`${dir}/`, new URL('file://' + ROOT)), { recursive: true }) as string[];
    } catch {
      entries = [];
    }
    for (const rel of entries) {
      const p = `${dir}/${rel}`;
      if (!p.endsWith('.tsx')) continue;
      if (p.includes('.test.') || p.includes('/__tests__/')) continue;
      files.push(p);
    }
  }
  return files.sort();
}

type Entry = { file: string; kind: string; text: string };

/** True if the node is rendered as a JSX child expression ({'x'} or a ternary in children), not an attribute value. */
function isJsxChild(node: ts.Node): boolean {
  let p: ts.Node | undefined = node.parent;
  while (p) {
    if (ts.isJsxExpression(p)) {
      const gp = p.parent;
      return !!gp && (ts.isJsxElement(gp) || ts.isJsxFragment(gp));
    }
    if (ts.isJsxAttribute(p)) return false;
    p = p.parent;
  }
  return false;
}

/** True if the node lives inside a <style> or <script> element (its content is code, not copy). */
function insideSkippedElement(node: ts.Node): boolean {
  let p: ts.Node | undefined = node.parent;
  while (p) {
    if (ts.isJsxElement(p)) {
      const name = p.openingElement.tagName.getText(p.getSourceFile());
      if (SKIP_ELEMENTS.has(name)) return true;
    }
    p = p.parent;
  }
  return false;
}

/** True if this property assignment is inside `export const metadata = { ... }`. */
function insideMetadata(node: ts.Node): boolean {
  let p: ts.Node | undefined = node.parent;
  while (p) {
    if (ts.isVariableDeclaration(p) && p.name.getText(p.getSourceFile()) === 'metadata') return true;
    p = p.parent;
  }
  return false;
}

function extract(): { corpus: Entry[]; raw: Map<string, string> } {
  const corpus: Entry[] = [];
  const raw = new Map<string, string>();
  for (const file of listTsxFiles()) {
    const src = readFileSync(new URL('file://' + ROOT + file), 'utf8');
    raw.set(file, src);
    const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    const walk = (node: ts.Node): void => {
      if (ts.isJsxText(node)) {
        const t = decodeEntities(node.text).replace(/\s+/g, ' ').trim();
        if (t) corpus.push({ file, kind: 'jsxText', text: t });
      } else if (ts.isJsxAttribute(node) && node.initializer) {
        const name = node.name.getText(sf);
        if (PROSE_ATTRS.has(name)) {
          const init = node.initializer;
          let v: string | null = null;
          if (ts.isStringLiteral(init)) v = init.text;
          else if (ts.isJsxExpression(init) && init.expression && ts.isStringLiteralLike(init.expression)) {
            v = init.expression.text;
          }
          if (v !== null) corpus.push({ file, kind: `attr:${name}`, text: decodeEntities(v) });
        }
      } else if (
        (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
        isJsxChild(node) &&
        !insideSkippedElement(node)
      ) {
        corpus.push({ file, kind: 'childStr', text: decodeEntities(node.text) });
      } else if (ts.isTemplateExpression(node) && isJsxChild(node) && !insideSkippedElement(node)) {
        const t = decodeEntities(
          [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join('')
        ).trim();
        if (t) corpus.push({ file, kind: 'childTmpl', text: t });
      } else if (
        ts.isPropertyAssignment(node) &&
        ts.isStringLiteralLike(node.initializer) &&
        (node.name.getText(sf) === 'title' || node.name.getText(sf) === 'description') &&
        insideMetadata(node)
      ) {
        corpus.push({ file, kind: `meta:${node.name.getText(sf)}`, text: decodeEntities(node.initializer.text) });
      }
      ts.forEachChild(node, walk);
    };
    walk(sf);
  }
  return { corpus, raw };
}

const { corpus, raw } = extract();

/** Matches emoji (pictographic, regional-indicator flags, keycaps, VS16) but NOT typographic glyphs. */
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{20E3}\u{FE0F}]/u;

function offenders(pred: (e: Entry) => boolean): Entry[] {
  return corpus.filter(pred);
}
function textsOf(entries: Entry[]): string[] {
  return entries.map((e) => `${e.file} [${e.kind}] ${JSON.stringify(e.text)}`);
}

describe('scanner integrity — the lint is not silently scanning nothing', () => {
  it('parses a substantial number of .tsx files under components/ and app/', () => {
    const files = new Set(corpus.map((e) => e.file));
    expect(files.size).toBeGreaterThanOrEqual(20);
  });

  it('extracts a large corpus of user-facing strings', () => {
    expect(corpus.length).toBeGreaterThan(300);
  });

  it('captures real JSX prose (the landing hero)', () => {
    expect(corpus.some((e) => e.text === 'The board that updates itself.')).toBe(true);
  });

  it('captures prose from custom component props, not just native attributes', () => {
    // WorkflowPicker/Filters/consent pass sentences via headline/hint/label/title props.
    const joined = corpus.map((e) => e.text).join('\n');
    expect(joined).toContain('Repos Pulse watches');
    expect(joined).toContain('Let Pulse create tasks from branches');
  });

  it('captures the browser tab title from layout metadata', () => {
    const tab = corpus.find((e) => e.file === 'app/layout.tsx' && e.kind === 'meta:title');
    expect(tab?.text).toBe('Pulse — the board that updates itself');
  });

  it('excludes code — Tailwind class strings never enter the corpus', () => {
    // className is an attribute we do NOT whitelist; a leak would flood the lint with false data.
    expect(corpus.some((e) => /(?:^|\s)(?:min-h-11|text-zinc-\d|bg-emerald)/.test(e.text))).toBe(false);
  });

  it('excludes comments — the ⚠ warning glyph used only in JSDoc never enters the corpus', () => {
    // Landing.tsx and layout.tsx use ⚠ inside comments; if comments leaked, the emoji test below
    // would fail for the wrong reason. Prove they are structurally skipped.
    expect(corpus.some((e) => e.text.includes('⚠'))).toBe(false);
    expect(corpus.some((e) => e.text.includes('Facts only on this page'))).toBe(false);
  });

  it('excludes <style> CSS so a real "!important" cannot be mistaken for prose', () => {
    expect(corpus.some((e) => e.text.includes('!important'))).toBe(false);
    expect(corpus.some((e) => e.text.includes('grid-template-columns'))).toBe(false);
  });
});

describe('detectors are non-vacuous — they fire on the thing they claim to catch', () => {
  it('the emoji matcher flags actual emoji', () => {
    expect(EMOJI.test('Shipped \u{1F389}')).toBe(true); // 🎉
    expect(EMOJI.test('warning ⚠️')).toBe(true); // ⚠️
    expect(EMOJI.test('\u{1F1FA}\u{1F1F8}')).toBe(true); // 🇺🇸 regional indicators
    expect(EMOJI.test('3⃣')).toBe(true); // keycap
  });

  it('the emoji matcher does NOT flag the typographic glyphs this UI relies on', () => {
    for (const glyph of ['·', '—', '…', '▴', '▾', '⋯', '’']) {
      expect(EMOJI.test(glyph)).toBe(false);
    }
    // And there really are such glyphs in the live corpus, so this precision matters.
    expect(corpus.some((e) => /[·—…▴▾⋯]/.test(e.text))).toBe(true);
  });

  it('the exclamation check distinguishes prose punctuation from nothing', () => {
    expect('Ship it now!'.includes('!')).toBe(true);
    expect('Ship it now.'.includes('!')).toBe(false);
  });
});

describe('VOICE rule 3 — zero exclamation marks in user-facing copy', () => {
  it('no exclamation mark appears anywhere in the corpus', () => {
    const bad = offenders((e) => e.text.includes('!'));
    expect(textsOf(bad)).toEqual([]);
  });

  it('no exclamation mark in JSX text nodes', () => {
    const bad = offenders((e) => e.kind === 'jsxText' && e.text.includes('!'));
    expect(textsOf(bad)).toEqual([]);
  });

  it('no exclamation mark in prose attributes/props (titles, placeholders, labels, hints)', () => {
    const bad = offenders((e) => e.kind.startsWith('attr:') && e.text.includes('!'));
    expect(textsOf(bad)).toEqual([]);
  });

  it('no exclamation mark in metadata (tab title and description)', () => {
    const bad = offenders((e) => e.kind.startsWith('meta:') && e.text.includes('!'));
    expect(textsOf(bad)).toEqual([]);
  });
});

describe('VOICE rule 3 — zero emoji in user-facing copy', () => {
  it('no emoji appears anywhere in the corpus', () => {
    const bad = offenders((e) => EMOJI.test(e.text));
    expect(textsOf(bad)).toEqual([]);
  });

  it('no emoji in metadata (the tab title must not carry a pictograph)', () => {
    const bad = offenders((e) => e.kind.startsWith('meta:') && EMOJI.test(e.text));
    expect(textsOf(bad)).toEqual([]);
  });

  it('no flag, keycap, or variation-selector emoji specifically', () => {
    const specific = /[\u{1F1E6}-\u{1F1FF}\u{20E3}\u{FE0F}]/u;
    const bad = offenders((e) => specific.test(e.text));
    expect(textsOf(bad)).toEqual([]);
  });
});

describe('the pitch — the tagline is "the board that updates itself"', () => {
  it('the tagline appears in user-facing copy (case-insensitive)', () => {
    const hits = corpus.filter((e) => /the board that updates itself/i.test(e.text));
    expect(hits.length).toBeGreaterThan(0);
  });

  it('the landing hero is exactly "The board that updates itself."', () => {
    const hero = corpus.find((e) => e.file === 'components/Landing.tsx' && e.kind === 'jsxText' && /updates itself/i.test(e.text));
    expect(hero?.text).toBe('The board that updates itself.');
  });

  it('the browser tab title is exactly "Pulse — the board that updates itself"', () => {
    const tab = corpus.find((e) => e.file === 'app/layout.tsx' && e.kind === 'meta:title');
    expect(tab?.text).toBe('Pulse — the board that updates itself');
  });
});

describe('the pitch — "heartbeat" is retired and must never return', () => {
  it('no user-facing string contains the word "heartbeat"', () => {
    const bad = offenders((e) => /heartbeat/i.test(e.text));
    expect(textsOf(bad)).toEqual([]);
  });

  it('the word "heartbeat" does not appear in any component/app source, comments included', () => {
    const bad = [...raw.entries()].filter(([, src]) => /heartbeat/i.test(src)).map(([f]) => f);
    expect(bad).toEqual([]);
  });
});

describe('VOICE reference strings are pinned verbatim (a rename is a voice regression)', () => {
  it('the 404 line is unchanged', () => {
    expect(corpus.some((e) => e.text === 'That page isn’t here. The cohort still is, though.')).toBe(true);
  });

  it('the consent rail line appears verbatim on /connect', () => {
    const onConnect = corpus.some((e) => e.file === 'app/connect/page.tsx' && e.text === 'Pulse will post without asking.');
    expect(onConnect).toBe(true);
  });

  it('the done-column empty state is the invitation, not an apology', () => {
    expect(corpus.some((e) => e.text === 'Ship something — it lands here by itself.')).toBe(true);
  });

  it('the honest-floor copy is present and calm', () => {
    const joined = corpus.map((e) => e.text).join('\n');
    expect(joined).toContain('Nothing needs you right now.');
    expect(joined).toContain('That’s allowed.');
  });
});
