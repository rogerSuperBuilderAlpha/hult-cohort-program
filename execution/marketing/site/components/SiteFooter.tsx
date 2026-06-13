import Link from 'next/link';
import { GITHUB_REPO_URL } from '@/lib/site-config';
import styles from '../app/page.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p>Hult International Business School · Cohort Developer Program</p>
      <nav className={styles.footerLinks} aria-label="Site">
        <Link href="/program">Program</Link>
        <Link href="/apply">Apply</Link>
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
