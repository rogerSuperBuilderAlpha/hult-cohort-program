import type { ReactNode } from 'react';
import styles from '../app/page.module.css';

/** Lightweight paragraphs, bold, links, and `-` bullet lists for program descriptions */
export function ProgramDescription({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className={styles.projectDescription}>
      {paragraphs.map((para, i) => (
        <DescriptionBlock key={i} text={para.trim()} />
      ))}
    </div>
  );
}

function DescriptionBlock({ text }: { text: string }) {
  const lines = text.split('\n').filter(Boolean);
  const isList = lines.length > 1 && lines.every((line) => line.startsWith('- '));

  if (isList) {
    return (
      <ul className={styles.projectDescriptionList}>
        {lines.map((line, i) => (
          <li key={i}>{formatInline(line.slice(2))}</li>
        ))}
      </ul>
    );
  }

  return <p>{formatInline(text)}</p>;
}

function formatInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        parts.push(
          <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer">
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    }
    last = match.index + token.length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
