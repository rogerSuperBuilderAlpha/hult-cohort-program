"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/app/actions/auth";
import { CIVILIZATION_QUOTES } from "@/lib/quotes";
import { ProgressBar } from "@/components/ui";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/submit", label: "Submit" },
  { href: "/admin", label: "MVP Admin" },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppShell({
  children,
  userId,
  displayName,
  githubUsername,
  civilizationIndex,
}: {
  children: React.ReactNode;
  userId: string;
  displayName: string;
  githubUsername: string | null;
  civilizationIndex: number;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      setIsDesktop(mq.matches);
      setSidebarOpen(mq.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [pathname, isDesktop]);

  const advanceQuote = () => {
    setQuoteVisible(false);
    window.setTimeout(() => {
      setQuoteIndex((i) => (i + 1) % CIVILIZATION_QUOTES.length);
      setQuoteVisible(true);
    }, 150);
  };

  const indexPct = Math.round(Math.min(1, Math.max(0, civilizationIndex)) * 100);
  const avatarSrc = githubUsername
    ? `https://github.com/${githubUsername}.png?size=80`
    : null;

  return (
    <div className="relative flex min-h-dvh">
      {!isDesktop && sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_96%,black)] transition-transform duration-200 md:static md:z-0 md:min-h-dvh ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:hidden"
        }`}
      >
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          <Link
            href="/dashboard"
            className="mb-2 px-2 font-[family-name:var(--font-display)] text-sm tracking-wide text-[var(--accent)]"
          >
            Mission Control
          </Link>
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-[var(--bg-soft)] font-medium text-[var(--ink)]"
                    : "text-[var(--muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={advanceQuote}
            className="rounded-lg px-3 py-2 text-left text-sm text-[var(--muted)] transition hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
          >
            Civilization Quotes
          </button>

          <div className="mt-3 rounded-lg border border-[var(--line)]/60 bg-[var(--bg)]/50 p-3">
            <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]/70">
              Quote
            </p>
            <p
              className={`text-sm italic leading-relaxed text-[var(--muted)] transition-opacity duration-150 ${
                quoteVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {CIVILIZATION_QUOTES[quoteIndex]}
            </p>
          </div>
        </nav>

        <div className="border-t border-[var(--line)] p-3">
          <Link
            href={`/profile/${userId}`}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--bg-soft)]"
          >
            <span className="inline-flex size-9 shrink-0 overflow-hidden rounded-full border border-[var(--line)] bg-[var(--bg-soft)]">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  alt=""
                  width={36}
                  height={36}
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center text-xs font-semibold text-[var(--accent)]">
                  {initials(displayName)}
                </span>
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{displayName}</span>
              <span className="block text-xs text-[var(--muted)]">View profile</span>
            </span>
          </Link>
          <form action={signOut} className="mt-1">
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_92%,black)]/95 backdrop-blur">
          <div className="grid h-14 grid-cols-[auto_1fr_auto] items-center gap-3 px-3 sm:px-4">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--bg-soft)]"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={sidebarOpen}
            >
              <span className="flex flex-col gap-1" aria-hidden>
                <span className="block h-0.5 w-4 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current" />
              </span>
            </button>

            <div className="mx-auto w-full max-w-md px-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs text-[var(--muted)] sm:text-sm">
                  Civilization Index
                </p>
                <p className="shrink-0 font-[family-name:var(--font-display)] text-sm font-semibold sm:text-base">
                  {indexPct}%
                </p>
              </div>
              <ProgressBar value={civilizationIndex} />
            </div>

            <Link
              href={`/profile/${userId}`}
              className="inline-flex size-9 shrink-0 overflow-hidden rounded-full border border-[var(--line)] bg-[var(--bg-soft)]"
              title={displayName}
            >
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  alt=""
                  width={36}
                  height={36}
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center text-xs font-semibold text-[var(--accent)]">
                  {initials(displayName)}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main
          className={`relative mx-auto w-full max-w-6xl flex-1 px-4 py-8 ${
            pathname.startsWith("/leaderboard") ? "max-w-none" : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
