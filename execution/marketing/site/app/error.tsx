'use client';

import Link from 'next/link';
import { PageFrame } from '@/components/PageFrame';
import styles from './page.module.css';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageFrame>
      <article className={styles.overview}>
        <p className={styles.eyebrow}>Error</p>
        <h1 className={styles.sectionTitle}>Something went wrong</h1>
        <p className={styles.overviewLead}>
          The page failed to load. Try again, or return home. If this keeps happening, email{' '}
          <a href="mailto:cohort@hult.edu">cohort@hult.edu</a>
          {error.digest ? ` (ref ${error.digest})` : ''}.
        </p>
        <div className={styles.heroActions}>
          <button type="button" className={styles.primaryBtn} onClick={() => reset()}>
            Try again
          </button>
          <Link href="/" className={styles.secondaryBtn}>
            Back to home
          </Link>
        </div>
      </article>
    </PageFrame>
  );
}
