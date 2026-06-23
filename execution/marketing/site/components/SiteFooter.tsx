'use client';

import Link from 'next/link';
import {
  ALGORITHMACY_CONFERENCE_URL,
  ALGORITHMACY_LAB_URL,
  GITHUB_REPO_URL,
} from '@/lib/site-config';
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

      <aside className={styles.footerResearch} aria-label="Algorithmacy research">
        <p className={styles.footerResearchLabel}>Research program</p>
        <p className={styles.footerResearchCopy}>
          <strong>Algorithmacy Lab</strong> — open science on how workers coordinate through
          algorithmic systems. Contribute field data, analysis, or code via pull request.{' '}
          <strong>Algorithmacy Conference 2026</strong> — the first global conference on this
          competency, Oct 28–31 in Port of Spain. Open-review submissions; abstracts due Aug 1.
          Hult is a research sponsor.
        </p>
        <p className={styles.footerResearchLinks}>
          <a href={ALGORITHMACY_LAB_URL} target="_blank" rel="noopener noreferrer">
            Algorithmacy Lab on GitHub
          </a>
          <span aria-hidden="true"> · </span>
          <a href={ALGORITHMACY_CONFERENCE_URL} target="_blank" rel="noopener noreferrer">
            algorithmacy.org
          </a>
        </p>
      </aside>

      <p className={styles.legal}>
        Platform source code is open under MIT. Enrollment requires the Program Agreement and
        Expectations Acknowledgment. Placement terms are defined in published program criteria.
      </p>
    </footer>
  );
}
