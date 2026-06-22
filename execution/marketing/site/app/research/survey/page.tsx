'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { ResearchSurvey } from '@/components/ResearchSurvey';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { useParticipantStatus } from '@/lib/use-participant-status';
import { isEnrolled, isApplicantInFlight, isAdmittedPendingRoster } from '@/lib/participant-status';
import styles from '../../page.module.css';

export default function ResearchSurveyPage() {
  const { configured, profile, loading, authError, signIn, getIdToken } = useGithubAuth();
  const { me, loading: statusLoading, error: statusError } = useParticipantStatus(
    getIdToken,
    Boolean(profile)
  );

  return (
    <main className={styles.main}>
      <SiteHeader
        links={[
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/program', label: 'Program' },
        ]}
      />

      <article className={styles.overview}>
        <p className={styles.eyebrow}>Fall 2026 · Research</p>
        <h1 className={styles.sectionTitle}>Cohort research survey</h1>
        <p className={styles.overviewLead}>
          A voluntary research study, approved by the Bentley University Institutional Review Board, on how
          people learn to coordinate through software systems. Three short surveys over the program.
          Taking part has no effect on your standing or assessment.
        </p>

        {!configured ? (
          <div className={styles.callout}>Survey unavailable — platform services not configured.</div>
        ) : loading || (profile && statusLoading) ? (
          <p className={styles.formNote}>Loading…</p>
        ) : !profile ? (
          <div className={styles.authGate}>
            <p className={styles.authGateLead}>Sign in with GitHub to take the survey.</p>
            <button type="button" className={styles.githubSignInBtn} onClick={() => void signIn()}>
              Sign in with GitHub
            </button>
            {authError ? <p className={styles.formError}>{authError}</p> : null}
          </div>
        ) : !isEnrolled(me) ? (
          <div className={styles.callout}>
            {isApplicantInFlight(me) ? (
              <p>
                <strong>Application under review.</strong> The research survey is for enrolled
                participants. <Link href="/apply">Continue on Apply →</Link>
              </p>
            ) : isAdmittedPendingRoster(me) ? (
              <p>
                <strong>Enrollment pending.</strong> The survey opens once your enrollment is finalized.
              </p>
            ) : (
              <p>
                <strong>Enrolled participants only.</strong> <Link href="/apply">Apply for Fall 2026 →</Link>
              </p>
            )}
          </div>
        ) : (
          <ResearchSurvey getIdToken={getIdToken} />
        )}

        {statusError ? <p className={styles.formError}>{statusError}</p> : null}
      </article>
    </main>
  );
}
