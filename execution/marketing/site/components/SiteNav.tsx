'use client';

import Link from 'next/link';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { isAdmitted } from '@/lib/participant-status';
import { useParticipantStatus } from '@/lib/use-participant-status';
import styles from '../app/page.module.css';

type NavLink = { href: string; label: string; cta?: boolean };

type SiteNavProps = {
  links?: NavLink[];
};

const DEFAULT_LINKS: NavLink[] = [
  { href: '/program', label: 'Program' },
  { href: '/', label: 'Home' },
];

export function SiteNav({ links = DEFAULT_LINKS }: SiteNavProps) {
  const { profile, loading: authLoading, getIdToken, signOut } = useGithubAuth();
  const { me, loading: meLoading } = useParticipantStatus(getIdToken, Boolean(profile));

  const admitted = isAdmitted(me);
  const hubLabel = authLoading || (profile && meLoading) ? '…' : admitted ? 'Dashboard' : 'Apply';

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
      <Link href="/apply" className={styles.navCta}>
        {hubLabel}
      </Link>
    </nav>
  );
}
