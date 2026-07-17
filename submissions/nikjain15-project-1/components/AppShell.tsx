'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { OfflineBanner } from './OfflineBanner';

const NAV = [
  // "home", not "week 1": next to the other one-word tabs, the trailing digit read as a
  // notification badge in first-run testing — the one thing this nav must never imply.
  { href: '/', label: 'home' },
  { href: '/board', label: 'board' },
  { href: '/projects', label: 'projects' },
  { href: '/recipes', label: 'recipes' },
];

/**
 * The signed-in shell: header, nav, and the auth gate.
 *
 * The header is sticky, but releases under max-height:500px — on a landscape phone a
 * sticky header eats the screen the board needs. Bottom nav below 480 keeps the targets
 * reachable one-handed; safe-area inset so it clears the home indicator.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/signin');
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-zinc-400">Loading…</p>
      </div>
    );
  }

  // The redirect is in flight; rendering the shell would flash it at a signed-out user.
  if (!user) return null;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Above the header, so it is the first thing read and cannot be scrolled past. */}
      <OfflineBanner />

      {/*
        Releases under max-HEIGHT:500px, not max-width. `max-[500px]:static` is Tailwind's
        max-*width* variant, so this did the opposite of what the comment above claimed on
        both axes: it stayed sticky on a landscape phone (390px tall — exactly where a
        sticky header eats the screen the board needs) and went static on a tall narrow
        phone, where sticking is the whole point. Height is the thing that breaks here, so
        height is what the query asks about.
      */}
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur [@media(max-height:500px)]:static">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
            <span className="text-sm font-medium">Pulse</span>
          </Link>

          {/* Below 480 this nav moves to the bottom bar; words return at 480. */}
          <nav className="ml-2 hidden items-center gap-1 min-[480px]:flex">
            {NAV.map((item) => (
              <NavLink key={item.href} {...item} active={isActive(pathname, item.href)} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/settings"
              className="text-xs text-zinc-400 transition-colors hover:text-zinc-200"
            >
              settings
            </Link>
            <button
              onClick={() => signOut().then(() => router.replace('/signin'))}
              className="text-xs text-zinc-400 transition-colors hover:text-zinc-200"
            >
              sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 min-[480px]:pb-10">
        {children}
      </main>

      {/* Bottom nav — under 480 only. pb keeps it above the home indicator. */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-zinc-800 bg-zinc-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur min-[480px]:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(pathname, item.href) ? 'page' : undefined}
            className={`flex min-h-[44px] flex-1 items-center justify-center py-3 text-xs transition-colors ${
              isActive(pathname, item.href) ? 'text-zinc-100' : 'text-zinc-400'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`rounded px-2 py-1 text-xs transition-colors ${
        active ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {label}
    </Link>
  );
}
