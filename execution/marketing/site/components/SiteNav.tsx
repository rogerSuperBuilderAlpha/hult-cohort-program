'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { useEnrollmentHub } from '@/lib/use-enrollment-hub';
import styles from '../app/page.module.css';

type NavLink = { href: string; label: string; cta?: boolean };

type SiteNavProps = {
  links: NavLink[];
};

function isCurrent(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ links }: SiteNavProps) {
  const pathname = usePathname();
  const { profile, signOut } = useGithubAuth();
  const hub = useEnrollmentHub();

  return (
    <nav className={styles.nav} aria-label="Primary">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={link.cta ? styles.navCta : undefined}
          aria-current={isCurrent(link.href, pathname) ? 'page' : undefined}
        >
          {link.label}
        </Link>
      ))}
      {profile ? (
        <Link href="/history" aria-current={pathname === '/history' ? 'page' : undefined}>
          History
        </Link>
      ) : null}
      {profile ? (
        <button type="button" className={styles.navSignOut} onClick={() => void signOut()}>
          Sign out
        </button>
      ) : null}
      <Link
        href={hub.href}
        className={styles.navCta}
        aria-current={pathname === hub.href ? 'page' : undefined}
      >
        {hub.label}
      </Link>
    </nav>
  );
}
