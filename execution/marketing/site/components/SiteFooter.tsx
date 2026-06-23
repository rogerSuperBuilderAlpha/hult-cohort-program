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
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <p className={styles.footerTitle}>Hult Cohort Developer Program</p>
            <p className={styles.footerSubtitle}>Hult International Business School</p>
          </div>
          <nav className={styles.footerLinks} aria-label="Site">
            <Link href="/program">Program</Link>
            <Link href={hub.href}>{hub.loading ? '…' : hub.enrolled ? 'Dashboard' : 'Apply'}</Link>
            {hub.signedIn ? <Link href="/history">History</Link> : null}
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <Link href="/llms.txt">llms.txt</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
          </nav>
        </div>

        <div className={styles.footerResearch} aria-label="Algorithmacy research">
          <p className={styles.footerResearchLabel}>Research</p>
          <div className={styles.footerResearchGrid}>
            <article className={styles.footerResearchCard}>
              <h3 className={styles.footerResearchTitle}>Algorithmacy Lab</h3>
              <p className={styles.footerResearchDesc}>
                Open science on coordination through algorithmic systems — contribute via pull
                request.
              </p>
              <a
                className={styles.footerResearchCta}
                href={ALGORITHMACY_LAB_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub repo →
              </a>
            </article>
            <article className={styles.footerResearchCard}>
              <h3 className={styles.footerResearchTitle}>Algorithmacy Conference 2026</h3>
              <p className={styles.footerResearchDesc}>
                Oct 28–31, Port of Spain · open-review submissions · abstracts due Aug 1.
              </p>
              <a
                className={styles.footerResearchCta}
                href={ALGORITHMACY_CONFERENCE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                algorithmacy.org →
              </a>
            </article>
          </div>
        </div>

        <p className={styles.legal}>
          Platform source code is open under MIT. Enrollment requires the Program Agreement and
          Expectations Acknowledgment.
        </p>
      </div>
    </footer>
  );
}
