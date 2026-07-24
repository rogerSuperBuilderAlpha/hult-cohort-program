"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  PLACEHOLDER_CHANNELS,
  PLACEHOLDER_DMS,
  PRIMARY_NAV,
} from "@/lib/nav";

function NavIcon({ label }: { label: string }) {
  const letter = label.charAt(0).toUpperCase();
  return (
    <span
      aria-hidden
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-white"
    >
      {letter}
    </span>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex min-h-full bg-[var(--color-bg)]">
      {/* Mobile overlay */}
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-[var(--color-dark)]/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        data-testid="app-sidebar"
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[var(--color-dark)] text-white transition-transform md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <div
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-primary)] text-sm font-bold text-white"
          >
            C
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight">Conexus</p>
            <p className="text-xs text-white/60">From Conversation to Coordination</p>
          </div>
        </div>

        <nav aria-label="Primary" className="flex flex-col gap-1 px-3">
          {PRIMARY_NAV.filter((item) => !item.stretch).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setSidebarOpen(false)}
                className={[
                  "flex items-center gap-3 rounded-[var(--radius-button)] px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[color-mix(in_srgb,var(--color-primary)_28%,transparent)] text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <NavIcon label={item.label} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/45">
            Channels
          </p>
          <ul className="mb-5 flex flex-col gap-0.5">
            {PLACEHOLDER_CHANNELS.map((channel) => (
              <li key={channel.id}>
                <Link
                  href={`/channels/${channel.id}`}
                  data-testid={`channel-link-${channel.id}`}
                  className="block rounded-[var(--radius-button)] px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-white/45">#</span> {channel.name}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/45">
            Direct messages
          </p>
          <ul className="flex flex-col gap-0.5">
            {PLACEHOLDER_DMS.map((dm) => (
              <li key={dm.id}>
                <Link
                  href={`/messages/${dm.id}`}
                  className="block rounded-[var(--radius-button)] px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  {dm.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-white/10 px-4 py-4">
          <p className="text-xs text-white/50">Phase A scaffold</p>
          <p className="text-sm font-medium text-white/90">Local build · Step 1</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-[color-mix(in_srgb,var(--color-secondary)_20%,transparent)] bg-[var(--color-surface)] px-4 md:px-6">
          <button
            type="button"
            data-testid="sidebar-toggle"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] text-[var(--color-dark)] md:hidden"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--color-dark)]">
              Conexus workspace
            </p>
            <p className="truncate text-xs text-[var(--color-secondary)]">
              Hult Cohort · Internal communications
            </p>
          </div>
          <div
            data-testid="notification-bell-placeholder"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg)] text-sm text-[var(--color-secondary)]"
            title="Notifications (Step 7)"
          >
            ⌄
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
