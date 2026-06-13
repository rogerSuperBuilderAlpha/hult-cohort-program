'use client';

import Link from 'next/link';
import type { ProgramProject } from '@/content/program';
import { AgentPromptHarness } from '@/components/AgentPromptHarness';
import { PeerRatingBoard, ProjectProgressPanel } from '@/components/ProjectProgressPanel';
import type { CohortStats } from '@/lib/cohort-stats-types';
import { cohortOrg, cohortOrgUrl } from '@/lib/cohort-config';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { buildProjectAgentPrompt, buildPublicAgentPrompt } from '@/lib/project-agent-prompt';
import { isAdmitted } from '@/lib/participant-status';
import { personalizeProgramText } from '@/lib/personalize-program';
import { useCohortStats } from '@/lib/use-cohort-stats';
import { useProjectProgress } from '@/lib/use-project-progress';
import { useParticipantStatus } from '@/lib/use-participant-status';
import styles from '../app/page.module.css';

type Props = {
  project: ProgramProject;
  prevSlug?: string;
  nextSlug?: string;
};

function peerReviewLabel(stats: CohortStats | null | undefined): string {
  if (!stats || stats.enrolledCount === 0) {
    return 'One mandatory review per other enrolled participant (count updates live)';
  }
  return `${stats.peerReviewCount} mandatory reviews (cohort size ${stats.enrolledCount})`;
}

function EnrolledView({
  project,
  handle,
  stats,
  prevSlug,
  nextSlug,
  getIdToken,
}: {
  project: ProgramProject;
  handle: string;
  stats: CohortStats | null;
  prevSlug?: string;
  nextSlug?: string;
  getIdToken: () => Promise<string | null>;
}) {
  const org = cohortOrg();
  const p = (text: string) => personalizeProgramText(text, handle, org, stats);
  const isOnboarding = project.slug === 'onboarding';
  const agentPrompt = buildProjectAgentPrompt(project, handle, org, stats);
  const { progress, loading: progressLoading, error: progressError, refresh: refreshProgress } =
    useProjectProgress(project.slug, getIdToken, true);

  return (
    <div className={styles.participantPanel}>
      <div className={styles.participantBanner}>
        <p className={styles.participantBannerEyebrow}>
          Enrolled · Fall 2026 · @{handle}
          {stats && stats.enrolledCount > 0 ? ` · Cohort ${stats.enrolledCount}` : ''}
        </p>
        <p className={styles.participantBannerLead}>
          {isOnboarding ? (
            <>
              <strong>{project.phaseLabel}</strong> — your active week. Complete the checklist and
              open your onboarding PR in the cohort roster repo.
            </>
          ) : project.voteWeek ? (
            <>
              <strong>{project.phaseLabel}</strong> — contest project with a vote week. Build solo,
              review every other participant
              {stats && stats.peerReviewCount > 0 ? ` (${stats.peerReviewCount} reviews)` : ''},
              submit a merged PR before the deadline.
            </>
          ) : (
            <>
              <strong>{project.phaseLabel}</strong> — {project.weeks}. Read requirements now;
              submission opens on schedule.
            </>
          )}
        </p>
      </div>

      {project.voteWeek && (
        <div className={styles.callout}>
          <strong>Review week.</strong> Try every peer build, then rate each one 👍 or 👎 on this page.
          Your ratings are private. After the deadline, the repo with the most thumbs up wins.
        </div>
      )}

      {progressLoading ? (
        <p className={styles.formNote}>Loading your progress…</p>
      ) : progressError ? (
        <p className={styles.formNote}>{progressError}</p>
      ) : progress ? (
        <ProjectProgressPanel project={project} progress={progress} handle={handle} />
      ) : null}

      <section className={styles.overviewBlock}>
        <h2 className={styles.participantHeading}>What is expected of you</h2>
        <ul className={styles.onboardingChecklist}>
          {project.expectations.map((item) => (
            <li key={item}>{p(item)}</li>
          ))}
        </ul>
      </section>

      <section className={styles.overviewBlock}>
        <h2 className={styles.participantHeading}>How you submit (PR, not a link form)</h2>
        <p className={styles.formNote} style={{ marginTop: 0, marginBottom: 16 }}>
          Cohort org:{' '}
          <a href={cohortOrgUrl()} target="_blank" rel="noopener noreferrer">
            github.com/{org}
          </a>{' '}
          — accept your invite before pushing.
        </p>
        <dl className={styles.dl}>
          <dt>Repo</dt>
          <dd>
            <code>{p(project.submission.repoPattern)}</code>
          </dd>
          <dt>PR title</dt>
          <dd>
            <code>{p(project.submission.prTitle)}</code>
          </dd>
          <dt>PR body must include</dt>
          <dd>
            <ul className={styles.onboardingChecklist}>
              {project.submission.prBodyMustInclude.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
          <dt>Deadline</dt>
          <dd>{project.submission.deadlineNote}</dd>
        </dl>
      </section>

      <AgentPromptHarness prompt={agentPrompt} personalized />

      {progress ? (
        <PeerRatingBoard
          projectSlug={project.slug}
          progress={progress}
          reviewerHandle={handle}
          getIdToken={getIdToken}
          onUpdated={() => void refreshProgress()}
        />
      ) : null}

      {project.reviews && !progress ? (
        <section className={styles.overviewBlock}>
          <h2 className={styles.participantHeading}>Peer review</h2>
          <p>
            <strong>{peerReviewLabel(stats)}.</strong> Artifact: {p(project.reviews.artifact)}. Due:{' '}
            {project.reviews.dueNote}.
          </p>
        </section>
      ) : null}

      <section className={styles.overviewBlock}>
        <h2 className={styles.participantHeading}>Pass gate</h2>
        {progress ? (
          <ul className={styles.progressChecklist}>
            <li className={progress.submission.merged ? styles.progressItemDone : styles.progressItemPending}>
              <span className={progress.submission.merged ? styles.progressIconDone : styles.progressIconPending}>
                {progress.submission.merged ? '✓' : '○'}
              </span>
              Submission PR merged or eligible miss documented
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
                  {progress.reviews.writtenCompleted}/{progress.reviews.required} written GitHub
                  reviews
                </li>
                <li
                  className={
                    progress.reviews.ratingsCompleted >= progress.reviews.required
                      ? styles.progressItemDone
                      : styles.progressItemPending
                  }
                >
                  <span
                    className={
                      progress.reviews.ratingsCompleted >= progress.reviews.required
                        ? styles.progressIconDone
                        : styles.progressIconPending
                    }
                  >
                    {progress.reviews.ratingsCompleted >= progress.reviews.required ? '✓' : '○'}
                  </span>
                  {progress.reviews.ratingsCompleted}/{progress.reviews.required} private votes
                  (👍/👎)
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
          <ul className={styles.onboardingChecklist}>
            {project.passGate.map((item) => (
              <li key={item}>{p(item)}</li>
            ))}
          </ul>
        )}
      </section>

      <div className={styles.participantActions}>
        <Link href="/apply" className={styles.secondaryBtn}>
          Dashboard
        </Link>
        {prevSlug && (
          <Link href={`/program/${prevSlug}`} className={styles.secondaryBtn}>
            ← Previous
          </Link>
        )}
        {nextSlug && (
          <Link href={`/program/${nextSlug}`} className={styles.primaryBtn}>
            Next project →
          </Link>
        )}
      </div>
    </div>
  );
}

function PublicView({
  project,
  stats,
}: {
  project: ProgramProject;
  stats: CohortStats | null;
}) {
  const p = (text: string) =>
    personalizeProgramText(text, '{handle}', '{org}', stats ?? undefined);
  const agentPrompt = buildPublicAgentPrompt(project, stats);

  return (
    <>
      <p className={styles.formNote} style={{ marginTop: 0 }}>
        Template placeholders <code>{'{org}'}</code> and <code>{'{handle}'}</code> are replaced after
        you enroll.
        {stats && stats.enrolledCount > 0 ? (
          <>
            {' '}
            Current cohort: <strong>{stats.enrolledCount}</strong> enrolled (
            {stats.peerReviewCount} peer reviews per Phase 1 project).
          </>
        ) : (
          <> Peer review counts update from the live roster.</>
        )}{' '}
        <Link href="/apply">Sign in to apply</Link>.
      </p>

      {project.voteWeek && (
        <div className={styles.callout}>
          <strong>Review week.</strong> Rate every peer build 👍 or 👎 on the platform after trying
          their deploy. Ratings are private. The repo with the most thumbs up wins.
        </div>
      )}

      <section className={styles.overviewBlock}>
        <h2>What is expected of you</h2>
        <ul>
          {project.expectations.map((item) => (
            <li key={item}>{p(item)}</li>
          ))}
        </ul>
      </section>

      <section className={styles.overviewBlock}>
        <h2>How you submit (PR, not a link form)</h2>
        <dl className={styles.dl}>
          <dt>Repo</dt>
          <dd>
            <code>{p(project.submission.repoPattern)}</code>
          </dd>
          <dt>PR title</dt>
          <dd>
            <code>{p(project.submission.prTitle)}</code>
          </dd>
          <dt>PR body must include</dt>
          <dd>
            <ul>
              {project.submission.prBodyMustInclude.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
          <dt>Deadline</dt>
          <dd>{project.submission.deadlineNote}</dd>
        </dl>
      </section>

      <AgentPromptHarness prompt={agentPrompt} personalized={false} />

      {project.reviews && (
        <section className={styles.overviewBlock}>
          <h2>Peer review</h2>
          <p>
            <strong>{peerReviewLabel(stats)}.</strong> Artifact: {p(project.reviews.artifact)}. Due:{' '}
            {project.reviews.dueNote}.
          </p>
        </section>
      )}

      <section className={styles.overviewBlock}>
        <h2>Pass gate</h2>
        <ul>
          {project.passGate.map((item) => (
            <li key={item}>{p(item)}</li>
          ))}
        </ul>
      </section>

      {project.voteWeek && (
        <section className={styles.overviewBlock}>
          <h2>Winner selection</h2>
          <p>
            Each participant rates every other merged build with a private 👍 or 👎. After review
            week closes, the repo with the <strong>most thumbs up</strong> wins. Live tallies are
            never shown during voting.
          </p>
        </section>
      )}
    </>
  );
}

export function ProgramProjectView({ project, prevSlug, nextSlug }: Props) {
  const { profile, loading: authLoading, getIdToken } = useGithubAuth();
  const { me, loading: statusLoading } = useParticipantStatus(getIdToken, Boolean(profile));
  const { stats: fetchedStats, loading: statsLoading } = useCohortStats();

  const loading = authLoading || (Boolean(profile) && statusLoading) || statsLoading;
  const admitted = isAdmitted(me);
  const handle = me?.githubHandle;
  const stats = me?.cohortStats ?? fetchedStats;

  if (loading) {
    return <p className={styles.formNote}>Loading your participant view…</p>;
  }

  if (admitted && profile && handle) {
    return (
      <EnrolledView
        project={project}
        handle={handle}
        stats={stats}
        prevSlug={prevSlug}
        nextSlug={nextSlug}
        getIdToken={getIdToken}
      />
    );
  }

  return <PublicView project={project} stats={stats} />;
}
