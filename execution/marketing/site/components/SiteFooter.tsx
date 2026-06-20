'use client';

import Link from 'next/link';
import { GITHUB_REPO_URL } from '@/lib/site-config';
import { useEnrollmentHub } from '@/lib/use-enrollment-hub';
import styles from '../app/page.module.css';

export function SiteFooter() {
  const hub = useEnrollmentHub();

  return (
    <footer className={styles.footer}>
      <p>Hult International Business School · Cohort Developer Program</p>
      <nav className={styles.footerLinks} aria-label="Site">
        <Link href="/program">Program</Link>
        <Link href={hub.href}>{hub.loading ? '…' : hub.enrolled ? 'Dashboard' : 'Apply'}</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <Link href="/llms.txt">llms.txt</Link>
        <Link href="/sitemap.xml">Sitemap</Link>
      </nav>
      <p className={styles.legal}>
        Platform source code is open under MIT. Enrollment requires the Program Agreement and
        Expectations Acknowledgment. Placement terms are defined in published program criteria.
      </p>
    </footer>
  );
}
