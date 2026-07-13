'use client';

import { cohortLiveSession } from '@/content/program';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { isAdmittedPendingRoster, isEnrolled } from '@/lib/participant-status';
import { useParticipantStatus } from '@/lib/use-participant-status';
import styles from '../app/page.module.css';

/** Global header strip: Zoom session for signed-in accepted participants. */
export function LiveSessionBanner() {
  const { profile, getIdToken } = useGithubAuth();
  const { me, loading } = useParticipantStatus(getIdToken, Boolean(profile));

  if (!profile || loading) return null;
  if (!isEnrolled(me) && !isAdmittedPendingRoster(me)) return null;

  const session = cohortLiveSession;

  return (
    <div className={styles.sessionBanner} role="status">
      <span className={styles.sessionBannerText}>
        <strong>{session.label}</strong>
        <span aria-hidden="true"> · </span>
        {session.when}
      </span>
      <a
        className={styles.sessionBannerLink}
        href={session.zoomUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Join Zoom
      </a>
      {session.agendaUrl ? (
        <a
          className={styles.sessionBannerSecondary}
          href={session.agendaUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Agenda
        </a>
      ) : null}
    </div>
  );
}
