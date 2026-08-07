'use client';

import type { ProgramProject } from '@/content/program';
import { VOTE_PRIVACY_NOTE, WINNER_NOTE } from '@/lib/review-week-copy';
import styles from '../app/page.module.css';

function StatusIcon({ done }: { done: boolean }) {
  return (
    <span className={done ? styles.progressIconDone : styles.progressIconPending} aria-hidden>
      {done ? '✓' : '○'}
    </span>
  );
}

function whatsLeft(progress: import('@/lib/project-progress-types').ProjectProgress): string {
  const items: string[] = [];

  if (!progress.submission.merged) {
    items.push('submit and merge your submission pull request');
  }

  if (progress.reviews) {
    const writtenLeft = progress.reviews.required - progress.reviews.writtenCompleted;
    const voteLeft = progress.reviews.required - progress.reviews.ratingsCompleted;
    if (writtenLeft > 0) {
      items.push(`file ${writtenLeft} more written review${writtenLeft === 1 ? '' : 's'}`);
    }
    if (voteLeft > 0) {
      items.push(`cast ${voteLeft} more private vote${voteLeft === 1 ? '' : 's'}`);
    }
  }

  if (items.length === 0) {
    return progress.reviews?.voteWeek
      ? `All requirements complete. ${WINNER_NOTE}`
      : 'All pass-gate requirements complete for this project.';
  }

  return `Remaining: ${items.join('; ')}.`;
}

type Props = {
  project: ProgramProject;
  progress: import('@/lib/project-progress-types').ProjectProgress;
  handle: string;
};

export function ProjectProgressPanel({ project, progress, handle }: Props) {
  const reviews = progress.reviews;
  const writtenDone =
    !reviews || reviews.required === 0 || reviews.writtenCompleted >= reviews.required;
  const votesDone =
    !reviews || reviews.required === 0 || reviews.ratingsCompleted >= reviews.required;
  const allDone = progress.submission.merged && writtenDone && votesDone;

  return (
    <section
      className={`${styles.progressPanel} ${allDone ? styles.progressPanelComplete : styles.progressPanelActive}`}
    >
      <h2 className={styles.participantHeading} style={{ marginTop: 0 }}>
        Your progress
      </h2>
      <p className={styles.progressSummary}>{whatsLeft(progress)}</p>

      <ul className={styles.progressChecklist}>
        <li className={progress.submission.merged ? styles.progressItemDone : styles.progressItemPending}>
          <StatusIcon done={progress.submission.merged} />
          <div>
            <strong>Submission pull request merged</strong>
            {progress.submission.merged ? (
              <p className={styles.progressDetail}>
                <a href={progress.submission.prUrl} target="_blank" rel="noopener noreferrer">
                  View your pull request
                </a>
                {progress.submission.deployUrl ? (
                  <>
                    {' '}
                    ·{' '}
                    <a href={progress.submission.deployUrl} target="_blank" rel="noopener noreferrer">
                      deployment
                    </a>
                  </>
                ) : null}
              </p>
            ) : (
              <p className={styles.progressDetail}>
                Open a pull request titled{' '}
                <code>{project.submission.prTitle.replace('{handle}', handle)}</code> in{' '}
                <a href={progress.submission.repoUrl} target="_blank" rel="noopener noreferrer">
                  {progress.submission.repo}
                </a>{' '}
                and merge before the deadline.
              </p>
            )}
          </div>
        </li>

        {reviews ? (
          <>
            {reviews.reviewWindowStatus === 'not-yet' && reviews.reviewOpensFormatted ? (
              <li className={styles.progressItemPending}>
                <StatusIcon done={false} />
                <div>
                  <strong>Review week has not opened</strong>
                  <p className={styles.progressDetail}>
                    Written reviews and private votes become available{' '}
                    {reviews.reviewOpensFormatted}.
                  </p>
                </div>
              </li>
            ) : reviews.reviewWindowStatus === 'closed' ? (
              <li className={styles.progressItemPending}>
                <StatusIcon done={false} />
                <div>
                  <strong>Review week closed</strong>
                  <p className={styles.progressDetail}>
                    {reviews.reviewClosesFormatted
                      ? `Closed ${reviews.reviewClosesFormatted}.`
                      : 'No new reviews or votes can be filed.'}
                  </p>
                </div>
              </li>
            ) : null}
            <li className={writtenDone ? styles.progressItemDone : styles.progressItemPending}>
              <StatusIcon done={writtenDone} />
              <div>
                <strong>
                  Written reviews {reviews.writtenCompleted}/{reviews.required}
                </strong>
                <p className={styles.progressDetail}>
                  Written review (GitHub issue) titled <code>Review by @{handle}</code> on each peer
                  repository.
                </p>
              </div>
            </li>
            <li className={votesDone ? styles.progressItemDone : styles.progressItemPending}>
              <StatusIcon done={votesDone} />
              <div>
                <strong>
                  Private votes {reviews.ratingsCompleted}/{reviews.required}
                </strong>
                <p className={styles.progressDetail}>
                  Cast your vote on this page after each written review. {VOTE_PRIVACY_NOTE}
                </p>
                <p className={styles.progressDetail}>
                  <a href="#peer-ratings">Go to review and vote list →</a>
                </p>
              </div>
            </li>
          </>
        ) : null}
      </ul>
    </section>
  );
}
