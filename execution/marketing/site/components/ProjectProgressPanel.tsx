'use client';

import type { ProgramProject } from '@/content/program';
import { VOTE_NOTE, WINNER_NOTE } from '@/lib/review-week-copy';
import { personalizeProgramText } from '@/lib/personalize-program';
import { reviewIssueTitle } from '@/lib/written-reviews-format';
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
    if (writtenLeft > 0) {
      items.push(`file ${writtenLeft} more written review${writtenLeft === 1 ? '' : 's'} on GitHub`);
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
  const schedule = progress.schedule;
  const writtenDone =
    !reviews || reviews.required === 0 || reviews.writtenCompleted >= reviews.required;
  const allDone = progress.submission.merged && writtenDone;
  const reviewTitleExample = reviewIssueTitle(handle, 'peer-handle');

  return (
    <section
      className={`${styles.progressPanel} ${allDone ? styles.progressPanelComplete : styles.progressPanelActive}`}
    >
      <h2 className={styles.participantHeading} style={{ marginTop: 0 }}>
        Your progress
      </h2>
      <p className={styles.progressSummary}>{whatsLeft(progress)}</p>

      <ul className={styles.progressChecklist}>
        {schedule && schedule.submissionWindowStatus !== 'none' ? (
          <li
            className={
              schedule.submissionWindowStatus === 'open'
                ? styles.progressItemPending
                : styles.progressItemDone
            }
            aria-label={`Submission window: ${schedule.submissionWindowStatus}`}
          >
            <StatusIcon done={schedule.submissionWindowStatus === 'closed' && progress.submission.merged} />
            <div>
              <strong>
                {schedule.submissionWindowStatus === 'not-yet'
                  ? 'Submission window not yet open'
                  : schedule.submissionWindowStatus === 'closed'
                    ? 'Submission window closed'
                    : 'Submission window open'}
              </strong>
              <p className={styles.progressDetail}>
                {schedule.submissionWindowStatus === 'not-yet' && schedule.submissionOpensFormatted
                  ? `Opens ${schedule.submissionOpensFormatted}.`
                  : null}
                {schedule.submissionWindowStatus === 'open' && schedule.submissionClosesFormatted
                  ? `Merge by ${schedule.submissionClosesFormatted}. ${schedule.deadlineNote ?? ''}`
                  : null}
                {schedule.submissionWindowStatus === 'closed' && schedule.submissionClosesFormatted
                  ? `Closed ${schedule.submissionClosesFormatted}. Unmerged pull requests are ineligible.`
                  : null}
              </p>
            </div>
          </li>
        ) : null}
        <li
          className={progress.submission.merged ? styles.progressItemDone : styles.progressItemPending}
          aria-label={
            progress.submission.merged
              ? 'Submission pull request merged: complete'
              : 'Submission pull request merged: incomplete'
          }
        >
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
                <code>{personalizeProgramText(project.submission.prTitle, handle)}</code> in{' '}
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
              <li className={styles.progressItemPending} aria-label="Review week: not yet open">
                <StatusIcon done={false} />
                <div>
                  <strong>Review week has not opened</strong>
                  <p className={styles.progressDetail}>
                    Written reviews become available{' '}
                    {reviews.reviewOpensFormatted}.
                  </p>
                </div>
              </li>
            ) : reviews.reviewWindowStatus === 'closed' ? (
              <li className={styles.progressItemPending} aria-label="Review week: closed">
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
            <li
              className={writtenDone ? styles.progressItemDone : styles.progressItemPending}
              aria-label={`Written reviews: ${reviews.writtenCompleted} of ${reviews.required} discovered from GitHub`}
            >
              <StatusIcon done={writtenDone} />
              <div>
                <strong>
                  Written reviews {reviews.writtenCompleted}/{reviews.required}
                </strong>
                <p className={styles.progressDetail}>
                  File a GitHub issue titled <code>{reviewTitleExample}</code> on each peer&apos;s{' '}
                  <strong>app/build repo</strong> (use the Peer review tab — it opens the correct New
                  Issue form). Keep <code>Vote: up</code> to upvote, or delete that section to abstain.
                  Click <strong>Submit new issue</strong> on GitHub, then refresh here. {VOTE_NOTE}
                </p>
                <p className={styles.progressDetail}>
                  Upvotes so far (optional): {reviews.upvotesCompleted}/{reviews.required}.{' '}
                  <a href="#peer-ratings">Full instructions &amp; peer list →</a>
                </p>
              </div>
            </li>
          </>
        ) : null}
      </ul>
    </section>
  );
}
