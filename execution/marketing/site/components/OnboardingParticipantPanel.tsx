'use client';

import Link from 'next/link';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { isAdmitted } from '@/lib/participant-status';
import { useParticipantStatus } from '@/lib/use-participant-status';
import styles from '../app/page.module.css';

const CHECKLIST = [
  'Cursor + Claude Code active ($400/mo combined)',
  'GitHub account linked; org invite accepted',
  'Complete repo-exploration workshop',
  'Attend live kickoffs; refund window ends Friday 5pm',
  'Tooling verification checklist signed in cohort roster',
  'Expectations Acknowledgment signed',
];

export function OnboardingParticipantPanel() {
  const { profile, loading: authLoading, getIdToken } = useGithubAuth();
  const { me, loading: statusLoading } = useParticipantStatus(getIdToken, Boolean(profile));

  if (authLoading || statusLoading || !profile || !isAdmitted(me)) {
    return null;
  }

  const handle = me!.githubHandle;
  const prTitle = `[Onboarding] Tooling checklist — ${handle}`;

  return (
    <div className={styles.participantPanel}>
      <div className={styles.calloutSuccess}>
        <p>
          <strong>Your Week 1 project.</strong> No contest vote this week — complete onboarding and
          sign your checklist in the cohort roster repo.
        </p>
      </div>

      <h2 className={styles.participantHeading}>Week 1 checklist</h2>
      <ul className={styles.onboardingChecklist}>
        {CHECKLIST.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2 className={styles.participantHeading}>How you submit</h2>
      <dl className={styles.dl}>
        <dt>Repo</dt>
        <dd>
          <code>hult-cohort-fall26-boston/roster</code> (accept org invite first)
        </dd>
        <dt>PR title</dt>
        <dd>
          <code>{prTitle}</code>
        </dd>
        <dt>PR body</dt>
        <dd>
          Tooling verification checklist for @{handle} — Cursor, Claude Code, GitHub SSH, agent
          workflow dry-run, and Expectations Acknowledgment link.
        </dd>
        <dt>Deadline</dt>
        <dd>Roster locked Sep 12 after refund window (Fri week 1, 17:00)</dd>
      </dl>

      <div className={styles.participantActions}>
        <Link href="/apply" className={styles.secondaryBtn}>
          ← Dashboard
        </Link>
        <Link href="/program/phase-1-project-1" className={styles.primaryBtn}>
          Preview Project 1 →
        </Link>
      </div>
    </div>
  );
}
