'use client';

import Link from 'next/link';
import { GITHUB_REPO_URL } from '@/lib/site-config';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { isEnrolled } from '@/lib/participant-status';
import { useParticipantStatus } from '@/lib/use-participant-status';
import styles from '../app/page.module.css';

export function SiteFooter() {
  const { profile, getIdToken } = useGithubAuth();
  const { me } = useParticipantStatus(getIdToken, Boolean(profile));
  const hubHref = isEnrolled(me) ? '/dashboard' : '/apply';
  const hubLabel = isEnrolled(me) ? 'Dashboard' : 'Apply';

  return (
    <footer className={styles.footer}>
      <p>Hult International Business School · Cohort Developer Program</p>
      <nav className={styles.footerLinks} aria-label="Site">
        <Link href="/program">Program</Link>
        <Link href={hubHref}>{hubLabel}</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <Link href="/llms.txt">llms.txt</Link>
        <Link href="/sitemap.xml">Sitemap</Link>
      </nav>
      <p className={styles.legal}>
        Open source under MIT · Program Agreement and Expectations Acknowledgment required at
        enrollment · Job placement terms subject to published criteria
      </p>
    </footer>
  );
}
