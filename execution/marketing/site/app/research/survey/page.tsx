'use client';

import Link from 'next/link';
import { EnrollmentGate } from '@/components/EnrollmentGate';
import { PageFrame } from '@/components/PageFrame';
import { ResearchSurvey } from '@/components/ResearchSurvey';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { useParticipantStatus } from '@/lib/use-participant-status';
import { isApplicantInFlight, isAdmittedPendingRoster } from '@/lib/participant-status';
import styles from '../../page.module.css';

export default function ResearchSurveyPage() {
  const { profile, authError, signIn, getIdToken } = useGithubAuth();
  const { me, error: statusError } = useParticipantStatus(
    getIdToken,
    Boolean(profile)
  );

  return (
    <PageFrame>
      <article className={styles.overview}>
        <p className={styles.eyebrow}>Research survey</p>
        <h1 className={styles.sectionTitle}>Cohort research survey</h1>
        <p className={styles.overviewLead}>
          A voluntary research study, approved by the Bentley University Institutional Review Board, on how
          people learn to coordinate through software systems. Three short surveys — before week 1, after
          week 3, and after week 6. Taking part has no effect on your standing or assessment.
        </p>

        <EnrollmentGate
          unconfiguredMessage="Survey unavailable — platform services not configured."
          signedOut={
            <div className={styles.authGate}>
              <p className={styles.authGateLead}>Sign in with GitHub to take the survey.</p>
              <button type="button" className={styles.githubSignInBtn} onClick={() => void signIn()}>
                Sign in with GitHub
              </button>
              {authError ? <p className={styles.formError}>{authError}</p> : null}
            </div>
          }
          notEnrolled={
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
          }
          enrolled={<ResearchSurvey getIdToken={getIdToken} />}
        />

        {statusError ? <p className={styles.formError}>{statusError}</p> : null}
      </article>
    </PageFrame>
  );
}
