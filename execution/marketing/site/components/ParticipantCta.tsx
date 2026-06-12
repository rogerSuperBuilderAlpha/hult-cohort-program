'use client';

import Link from 'next/link';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { isAdmitted } from '@/lib/participant-status';
import { useParticipantStatus } from '@/lib/use-participant-status';
import styles from '../app/page.module.css';

type ParticipantCtaProps = {
  variant?: 'hero' | 'nav';
};

export function ParticipantCta({ variant = 'hero' }: ParticipantCtaProps) {
  const { profile, loading: authLoading, getIdToken } = useGithubAuth();
  const { me, loading: meLoading } = useParticipantStatus(getIdToken, Boolean(profile));

  const admitted = isAdmitted(me);
  const loading = authLoading || (Boolean(profile) && meLoading);
  const className = variant === 'nav' ? styles.navCta : styles.primaryBtn;

  if (loading) {
    return (
      <span className={className} style={{ opacity: 0.7 }}>
        …
      </span>
    );
  }

  if (admitted) {
    return (
      <Link href="/apply" className={className}>
        {variant === 'nav' ? 'Dashboard' : 'Open your dashboard'}
      </Link>
    );
  }

  return (
    <Link href="/apply" className={className}>
      {variant === 'nav' ? 'Apply' : 'Apply for Fall 2026'}
    </Link>
  );
}
