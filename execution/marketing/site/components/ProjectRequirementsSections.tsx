'use client';

import type { ProgramProject } from '@/content/program';
import type { CohortStats } from '@/lib/cohort-stats-types';
import { cohortSubmissionRepo, participantBranch, projectBranch } from '@/lib/cohort-config';
import { cohortRepoUrl } from '@/lib/github-urls';
import type { ProjectProgress } from '@/lib/project-progress-types';
import styles from '../app/page.module.css';

type Props = {
  project: ProgramProject;
  p: (text: string) => string;
  stats: CohortStats | null;
  variant: 'enrolled' | 'public';
  progress?: ProjectProgress | null;
};

export function ProjectRequirementsSections({
  project,
  p,
  stats,
  variant,
  progress,
}: Props) {
  const activeCohortId = stats?.cohortId?.trim() || 'summer26';
  const headingClass =
    variant === 'enrolled' ? styles.participantHeading : undefined;

  return (
    <>
      <section className={styles.overviewBlock}>
        <h2 className={headingClass}>Requirements</h2>
        <ul className={variant === 'enrolled' ? styles.onboardingChecklist : undefined}>
          {project.expectations.map((item) => (
            <li key={item}>{p(item)}</li>
          ))}
        </ul>
      </section>

      <section className={styles.overviewBlock}>
        <h2 className={headingClass}>Submission instructions</h2>
        {variant === 'enrolled' ? (
          <p className={styles.formNote} style={{ marginTop: 0, marginBottom: 16 }}>
            Cohort repository:{' '}
            <a href={cohortRepoUrl()} target="_blank" rel="noopener noreferrer">
              github.com/{cohortSubmissionRepo()}
            </a>{' '}
            — branch from <code>{projectBranch(activeCohortId, project.slug)}</code> and open a pull
            request targeting that branch with the exact title below.
          </p>
        ) : null}
        <dl className={styles.dl}>
          <dt>Repo</dt>
          <dd>
            <code>{p(project.submission.repoPattern)}</code>
          </dd>
          <dt>Target branch</dt>
          <dd>
            <code>{projectBranch(activeCohortId, project.slug)}</code>
          </dd>
          <dt>Your branch</dt>
          <dd>
            <code>{participantBranch(activeCohortId, project.slug, p('{handle}'))}</code>
          </dd>
          <dt>Pull request title</dt>
          <dd>
            <code>{p(project.submission.prTitle)}</code>
          </dd>
          <dt>Pull request body must include</dt>
          <dd>
            <ul className={variant === 'enrolled' ? styles.onboardingChecklist : undefined}>
              {project.submission.prBodyMustInclude.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
          <dt>Deadline</dt>
          <dd>{project.submission.deadlineNote}</dd>
        </dl>
      </section>

      <section className={styles.overviewBlock}>
        <h2 className={headingClass}>Pass criteria</h2>
        {variant === 'enrolled' && progress ? (
          <ul className={styles.progressChecklist}>
            <li className={progress.submission.merged ? styles.progressItemDone : styles.progressItemPending}>
              <span className={progress.submission.merged ? styles.progressIconDone : styles.progressIconPending}>
                {progress.submission.merged ? '✓' : '○'}
              </span>
              Submission pull request merged or eligible miss documented
            </li>
            {progress.reviews ? (
              <>
                <li
                  className={
                    progress.reviews.writtenCompleted >= progress.reviews.required
                      ? styles.progressItemDone
                      : styles.progressItemPending
                  }
                >
                  <span
                    className={
                      progress.reviews.writtenCompleted >= progress.reviews.required
                        ? styles.progressIconDone
                        : styles.progressIconPending
                    }
                  >
                    {progress.reviews.writtenCompleted >= progress.reviews.required ? '✓' : '○'}
                  </span>
                  {progress.reviews.writtenCompleted}/{progress.reviews.required} written reviews
                </li>
                <li
                  className={
                    progress.reviews.upvotesCompleted > 0
                      ? styles.progressItemDone
                      : styles.progressItemPending
                  }
                >
                  <span
                    className={
                      progress.reviews.upvotesCompleted > 0
                        ? styles.progressIconDone
                        : styles.progressIconPending
                    }
                  >
                    {progress.reviews.upvotesCompleted > 0 ? '✓' : '○'}
                  </span>
                  {progress.reviews.upvotesCompleted}/{progress.reviews.required} optional upvotes
                </li>
              </>
            ) : null}
            {!progress.reviews
              ? project.passGate.map((item) => (
                  <li key={item}>{p(item)}</li>
                ))
              : null}
          </ul>
        ) : (
          <ul className={variant === 'enrolled' ? styles.onboardingChecklist : undefined}>
            {project.passGate.map((item) => (
              <li key={item}>{p(item)}</li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function peerReviewLabel(stats: CohortStats | null | undefined): string {
  if (!stats || stats.enrolledCount === 0) {
    return 'One required review per other enrolled participant (count updates as the cohort fills)';
  }
  return `${stats.peerReviewCount} required reviews (cohort size ${stats.enrolledCount})`;
}

export function ProjectPeerReviewSection({
  project,
  p,
  stats,
  variant,
  lockNotice,
}: {
  project: ProgramProject;
  p: (text: string) => string;
  stats: CohortStats | null;
  variant: 'enrolled' | 'public';
  /** When set, section is visible but peer list / votes are not loaded yet. */
  lockNotice?: string;
}) {
  if (!project.reviews) return null;

  return (
    <section className={styles.overviewBlock}>
      <h2 className={variant === 'enrolled' ? styles.participantHeading : undefined}>
        Peer review and voting
      </h2>
      {lockNotice ? (
        <div className={styles.callout}>
          <p style={{ marginBottom: 0 }}>
            <strong>Peer list not loaded yet.</strong> {lockNotice}
          </p>
        </div>
      ) : null}
      <p>
        <strong>{peerReviewLabel(stats)}.</strong> Deliverable: {p(project.reviews.artifact)}. Due:{' '}
        {project.reviews.dueNote}.
      </p>
      <p className={styles.formNote} style={{ marginBottom: 0 }}>
        For each peer: evaluate their deployment, read their submission pull request, then file a
        written GitHub review. Optionally keep <code>Vote: up</code> in the issue to upvote, or
        delete that section to abstain. This site shows your personal status only — not cohort
        tallies. Review week opens when the Sunday submission deadline closes.
      </p>
    </section>
  );
}
