import Link from 'next/link';
import { PageFrame } from '@/components/PageFrame';
import styles from './page.module.css';

export default function NotFound() {
  return (
    <PageFrame>
      <article className={styles.overview}>
        <p className={styles.eyebrow}>404</p>
        <h1 className={styles.sectionTitle}>Page not found</h1>
        <p className={styles.overviewLead}>
          That URL is not part of the Hult Cohort platform. Check the link or head back home.
        </p>
        <div className={styles.heroActions}>
          <Link href="/" className={styles.primaryBtn}>
            Back to home
          </Link>
          <Link href="/program" className={styles.secondaryBtn}>
            Program
          </Link>
        </div>
      </article>
    </PageFrame>
  );
}
