'use client';

import Link from 'next/link';
import { useEnrollmentHub } from '@/lib/use-enrollment-hub';
import styles from '../app/page.module.css';

export function ParticipantCta() {
  const hub = useEnrollmentHub();

  if (hub.loading) {
    return (
      <span className={styles.primaryBtn} style={{ opacity: 0.7 }}>
        …
      </span>
    );
  }

  return (
    <Link href={hub.href} className={styles.primaryBtn}>
      {hub.heroLabel}
    </Link>
  );
}
