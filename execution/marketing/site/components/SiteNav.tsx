'use client';

import Link from 'next/link';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { useEnrollmentHub } from '@/lib/use-enrollment-hub';
import styles from '../app/page.module.css';

type NavLink = { href: string; label: string; cta?: boolean };

type SiteNavProps = {
  links: NavLink[];
};

export function SiteNav({ links }: SiteNavProps) {
  const { profile, signOut } = useGithubAuth();
  const hub = useEnrollmentHub();

  return (
    <nav className={styles.nav}>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={link.cta ? styles.navCta : undefined}>
          {link.label}
        </Link>
      ))}
      {profile ? (
        <button type="button" className={styles.navSignOut} onClick={() => void signOut()}>
          Sign out
        </button>
      ) : null}
      <Link href={hub.href} className={styles.navCta}>
        {hub.label}
      </Link>
    </nav>
  );
}
