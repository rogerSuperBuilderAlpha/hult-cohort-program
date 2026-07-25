"use client";

import { forwardRef, FormEvent, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR_NAV_ITEMS } from "@/lib/navigation";

function getAssistantResponse(query: string): string {
  return `AI Assistant is coming soon. For now, this is a preview only.\n\nYour question: "${query.trim()}"`;
}

const AppSidebar = forwardRef<HTMLElement, { className?: string }>(function AppSidebar(
  { className = "" },
  ref
) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setResponse(getAssistantResponse(trimmed));
  };

  return (
    <aside
      ref={ref}
      aria-label="Command center"
      className={`flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-surface-border dark:bg-surface-card ${className}`}
    >
      <div className="shrink-0 border-b border-slate-200 px-4 pb-4 dark:border-surface-border">
        <p className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-surface-secondary">
          Command Center
        </p>
      </div>

      <nav className="shrink-0 px-3 py-2">
        <ul className="space-y-0.5">
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-surface-secondary dark:hover:bg-surface-bg dark:hover:text-surface-primary"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <section
        aria-label="AI Assistant"
        className="shrink-0 border-t border-slate-200 p-3 dark:border-surface-border"
      >
        <h2 className="text-sm font-semibold text-slate-900 dark:text-surface-primary">
          AI Assistant
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-surface-secondary">
          How can I help you today?
        </p>

        <form onSubmit={handleSubmit} className="mt-2 space-y-2">
          <label htmlFor="ai-assistant-query" className="sr-only">
            Ask the AI Assistant
          </label>
          <textarea
            id="ai-assistant-query"
            rows={2}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type your question..."
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary dark:placeholder:text-surface-secondary"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="w-full rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-2 dark:focus:ring-brand-500 dark:focus:ring-offset-2 dark:focus:ring-offset-surface-card"
          >
            Ask
          </button>
        </form>

        {response && (
          <div
            role="status"
            className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap text-slate-700 dark:border-surface-border dark:bg-surface-bg dark:text-surface-secondary"
          >
            {response}
          </div>
        )}
      </section>
    </aside>
  );
});

export default AppSidebar;
