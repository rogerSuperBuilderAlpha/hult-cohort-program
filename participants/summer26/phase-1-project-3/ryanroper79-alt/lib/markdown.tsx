import fs from 'node:fs';
import path from 'node:path';

/** Minimal markdown → React for PARTNERS.md (headings, lists, links, paragraphs). */
export function readPartnersMarkdown() {
  return readFileMarkdown(path.join(process.cwd(), 'PARTNERS.md'));
}

export function readFileMarkdown(filePath: string) {
  return fs.readFileSync(filePath, 'utf8');
}

type Block =
  | { type: 'h1' | 'h2' | 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'hr' };

function inline(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = link[2];
      const external = href.startsWith('http');
      return (
        <a
          key={i}
          href={href}
          className="text-ceal-leaf underline focus-ring rounded"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {link[1]}
        </a>
      );
    }
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={i}>{bold[1]}</strong>;
    return part;
  });
}

export function parseMarkdown(md: string): Block[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2).trim() });
      i += 1;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() });
      i += 1;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() });
      i += 1;
      continue;
    }
    if (line.trim() === '---') {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }
    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2).trim());
        i += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }
    const para: string[] = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('- ') && lines[i].trim() !== '---') {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: 'p', text: para.join(' ') });
  }

  return blocks;
}

export function MarkdownDocument({ md }: { md: string }) {
  const blocks = parseMarkdown(md);

  return (
    <article className="prose-ceal max-w-none space-y-6 text-ceal-ink">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1 key={idx} className="font-display text-4xl text-ceal-mangrove">
                {inline(block.text)}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={idx} className="font-display text-2xl text-ceal-mangrove">
                {inline(block.text)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={idx} className="font-display text-xl text-ceal-mangrove">
                {inline(block.text)}
              </h3>
            );
          case 'p':
            return (
              <p key={idx} className="leading-relaxed text-ceal-muted">
                {inline(block.text)}
              </p>
            );
          case 'ul':
            return (
              <ul key={idx} className="list-disc space-y-2 pl-5 text-ceal-muted">
                {block.items.map((item, j) => (
                  <li key={j}>{inline(item)}</li>
                ))}
              </ul>
            );
          case 'hr':
            return <hr key={idx} className="border-ceal-line" />;
          default:
            return null;
        }
      })}
    </article>
  );
}
