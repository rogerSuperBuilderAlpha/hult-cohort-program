'use client';

import Link from 'next/link';
import type { ProgramProject } from '@/content/program';
import { ProgramDescription } from '@/components/ProgramDescription';
import { AgentPromptHarness } from '@/components/AgentPromptHarness';
import { PeerRatingBoard } from '@/components/PeerRatingBoard';
import { ProjectProgressPanel } from '@/components/ProjectProgressPanel';
import {
  ProjectPeerReviewSection,
  ProjectRequirementsSections,
} from '@/components/ProjectRequirementsSections';
import type { CohortStats } from '@/lib/cohort-stats-types';
import { cohortOrg } from '@/lib/cohort-config';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { buildProjectAgentPrompt, buildPublicAgentPrompt } from '@/lib/project-agent-prompt';
import { isEnrolled, isAdmittedPendingRoster, isApplicantInFlight } from '@/lib/participant-status';
import { personalizeProgramText } from '@/lib/personalize-program';
import { useCohortStats } from '@/lib/use-cohort-stats';
import { useProjectProgress } from '@/lib/use-project-progress';
import { useParticipantStatus } from '@/lib/use-participant-status';
import {
  REVIEW_WEEK_CALLOUT_ENROLLED,
  REVIEW_WEEK_CALLOUT_PUBLIC,
  WINNER_SELECTION_PUBLIC,
} from '@/lib/review-week-copy';
import styles from '../app/page.module.css';

type Props = {
  project: ProgramProject;
  prevSlug?: string;
  nextSlug?: string;
};

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
              open your onboarding PR in the cohort repo.
            </>
          ) : project.voteWeek ? (
            <>
              <strong>{project.phaseLabel}</strong> — contest project with a review week. Build solo,
              file written reviews on every other participant
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
          <strong>Review week.</strong> {REVIEW_WEEK_CALLOUT_ENROLLED}
        </div>
      )}

      {progressLoading ? (
        <p className={styles.formNote}>Loading your progress…</p>
      ) : progressError ? (
        <p className={styles.formError}>{progressError}</p>
      ) : progress ? (
        <ProjectProgressPanel project={project} progress={progress} handle={handle} />
      ) : null}

      <ProjectRequirementsSections
        project={project}
        p={p}
        stats={stats}
        variant="enrolled"
        progress={progress}
      />

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
        <ProjectPeerReviewSection project={project} p={p} stats={stats} variant="enrolled" />
      ) : null}

      <div className={styles.participantActions}>
        <Link href="/dashboard" className={styles.secondaryBtn}>
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

function ApplicantInFlightBanner() {
  return (
    <div className={styles.callout}>
      <p>
        <strong>Application in review</strong> — finish your take-home PR. This is the journey
        you&apos;re applying to.{' '}
        <Link href="/dashboard">Back to dashboard →</Link>
      </p>
    </div>
  );
}

function PublicView({
  project,
  stats,
  applicantInFlight,
}: {
  project: ProgramProject;
  stats: CohortStats | null;
  applicantInFlight?: boolean;
}) {
  const p = (text: string) =>
    personalizeProgramText(text, '{handle}', '{org}', stats ?? undefined);
  const agentPrompt = buildPublicAgentPrompt(project, stats);

  return (
    <>
      <p className={styles.formNote} style={{ marginTop: 0 }}>
        Template placeholders <code>{'{repo}'}</code>, <code>{'{org}'}</code>, and{' '}
        <code>{'{handle}'}</code> are replaced after
        you enroll.
        {stats && stats.enrolledCount > 0 ? (
          <>
            {' '}
            Current cohort: <strong>{stats.enrolledCount}</strong> enrolled (
            {stats.peerReviewCount} peer reviews per Phase 1 project).
          </>
        ) : (
          <> Peer review counts update from the live roster.</>
        )}
        {applicantInFlight ? (
          <>
            {' '}
            <Link href="/dashboard">Back to dashboard</Link>.
          </>
        ) : (
          <>
            {' '}
            <Link href="/apply">Sign in to apply</Link>.
          </>
        )}
      </p>

      {project.voteWeek && (
        <div className={styles.callout}>
          <strong>Review week.</strong> {REVIEW_WEEK_CALLOUT_PUBLIC}
        </div>
      )}

      <ProjectRequirementsSections
        project={project}
        p={p}
        stats={stats}
        variant="public"
      />

      <AgentPromptHarness prompt={agentPrompt} personalized={false} />

      {project.reviews && (
        <ProjectPeerReviewSection project={project} p={p} stats={stats} variant="public" />
      )}

      {project.voteWeek && (
        <section className={styles.overviewBlock}>
          <h2>Winner selection</h2>
          <p>{WINNER_SELECTION_PUBLIC}</p>
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
  const enrolled = isEnrolled(me);
  const inFlight = isApplicantInFlight(me);
  const pendingRoster = isAdmittedPendingRoster(me);
  const handle = me?.githubHandle;
  const stats = me?.cohortStats ?? fetchedStats;
  const descriptionText = personalizeProgramText(
    project.description,
    enrolled && handle ? handle : '{handle}',
    cohortOrg(),
    stats ?? undefined
  );

  if (loading) {
    return (
      <>
        <ProgramDescription text={descriptionText} />
        <p className={styles.formNote}>Loading your participant view…</p>
      </>
    );
  }

  if (pendingRoster) {
    return (
      <>
        <ProgramDescription text={descriptionText} />
        <div className={styles.callout}>
          <p>
            <strong>Admitted — roster pending.</strong> Your application is approved; participant
            progress unlocks once staff add you to the roster. Email cohort@hult.edu if this
            persists.
          </p>
          <p className={styles.formNote} style={{ marginBottom: 0 }}>
            <Link href="/dashboard">Check your dashboard →</Link>
          </p>
        </div>
      </>
    );
  }

  if (enrolled && profile && handle) {
    return (
      <>
        <ProgramDescription text={descriptionText} />
      <EnrolledView
        project={project}
        handle={handle}
        stats={stats}
        prevSlug={prevSlug}
        nextSlug={nextSlug}
        getIdToken={getIdToken}
      />
      </>
    );
  }

  return (
    <>
      <ProgramDescription text={descriptionText} />
      {inFlight ? <ApplicantInFlightBanner /> : null}
      <PublicView project={project} stats={stats} applicantInFlight={inFlight} />
    </>
  );
}
