"use client";

import {
  buildForthTaskDeepLink,
  extractForthLinks,
  mentionPattern,
} from "@/lib/forth-links";

const PM_BASE = process.env.NEXT_PUBLIC_PM_PLATFORM_URL;

function renderTextWithMentions(text: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  const re = new RegExp(mentionPattern().source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <span key={`${m.index}-${m[1]}`} className="font-semibold text-moss">
        @{m[1]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function MessageBody({ body }: { body: string }) {
  const forthLinks = extractForthLinks(body, PM_BASE);

  return (
    <div className="space-y-2">
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
        {renderTextWithMentions(body)}
      </p>
      {forthLinks.length > 0 && (
        <ul className="space-y-2" aria-label="Forth task previews">
          {forthLinks.map(({ taskId, url }) => (
            <li
              key={taskId}
              className="rounded border border-moss/25 bg-paper px-3 py-2 text-sm"
            >
              <p className="text-xs uppercase tracking-wide text-moss">Forth task</p>
              <a
                href={buildForthTaskDeepLink(taskId, PM_BASE)}
                className="font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open task {taskId}
              </a>
              <p className="mt-1 truncate text-xs text-ink/60">{url}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
