'use client';

import type { ProgramProject } from '@/content/program';
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
    items.push('open and merge your submission PR');
  }

  if (progress.reviews) {
    const writtenLeft = progress.reviews.required - progress.reviews.writtenCompleted;
    const voteLeft = progress.reviews.required - progress.reviews.ratingsCompleted;
    if (writtenLeft > 0) {
      items.push(`file ${writtenLeft} more written review${writtenLeft === 1 ? '' : 's'}`);
    }
    if (voteLeft > 0) {
      items.push(`cast ${voteLeft} more private vote${voteLeft === 1 ? '' : 's'} (👍/👎)`);
    }
  }

  if (items.length === 0) {
    return progress.reviews?.voteWeek
      ? 'All requirements complete. Winner is the repo with the most thumbs up — announced after review week closes.'
      : 'All pass-gate requirements complete for this project.';
  }

  return `Still to do: ${items.join('; ')}.`;
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
            <strong>Submission PR merged</strong>
            {progress.submission.merged ? (
              <p className={styles.progressDetail}>
                <a href={progress.submission.prUrl} target="_blank" rel="noopener noreferrer">
                  View your PR
                </a>
                {progress.submission.deployUrl ? (
                  <>
                    {' '}
                    ·{' '}
                    <a href={progress.submission.deployUrl} target="_blank" rel="noopener noreferrer">
                      deploy
                    </a>
                  </>
                ) : null}
              </p>
            ) : (
              <p className={styles.progressDetail}>
                Open a PR titled <code>{project.submission.prTitle.replace('{handle}', handle)}</code>{' '}
                in{' '}
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
                    Written reviews and private votes unlock {reviews.reviewOpensFormatted}.
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
                  repo (public rubric).
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
                  👍 or 👎 on this page after each written review — only you see your votes.
                </p>
                <p className={styles.progressDetail}>
                  <a href="#peer-ratings">Go to review &amp; vote list →</a>
                </p>
              </div>
            </li>
          </>
        ) : null}
      </ul>
    </section>
  );
}
