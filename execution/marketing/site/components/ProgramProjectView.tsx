'use client';

import Link from 'next/link';
import type { ProgramProject } from '@/content/program';
import { ProgramDescription } from '@/components/ProgramDescription';
import { AgentPromptHarness } from '@/components/AgentPromptHarness';
import { PeerRatingBoard } from '@/components/PeerRatingBoard';
import { ProjectOutcomeBanner } from '@/components/ProjectOutcomeBanner';
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
import { useProjectProgress } from '@/lib/use-project-progress';
import { useParticipantStatus } from '@/lib/use-participant-status';
import { useSurveyState, projectSurveyGate, type ProjectGate } from '@/lib/research/use-survey-state';
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
  initialStats?: CohortStats | null;
};

function SurveyGateNotice({ project, gate }: { project: ProgramProject; gate: ProjectGate }) {
  const waveOpen = gate.wave?.status === 'open';
  const opensAt = gate.wave?.opensAt
    ? new Date(gate.wave.opensAt).toLocaleDateString('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className={styles.participantPanel}>
      <div className={styles.callout}>
        <p style={{ marginTop: 0 }}>
          <strong>One step first.</strong> {project.title} unlocks after you complete the{' '}
          {gate.wave ? gate.wave.shortLabel.toLowerCase() : 'research'} survey.
        </p>
        <p className={styles.formNote}>
          The survey is part of an IRB-approved research study and takes about 12 minutes. Participation
          is voluntary — if you choose <em>not</em> to take part, that choice also unlocks the project and
          has no effect on your standing, assessment, or place in the cohort.
        </p>
        {waveOpen ? (
          <Link href="/research/survey" className={styles.primaryBtn}>
            Go to the survey →
          </Link>
        ) : (
          <p className={styles.formNote} style={{ marginBottom: 0 }}>
            The survey opens {opensAt ?? 'soon'}. This project will unlock once you have responded.
          </p>
        )}
      </div>
      <div className={styles.participantActions}>
        <Link href="/dashboard" className={styles.secondaryBtn}>
          Dashboard
        </Link>
        <Link href="/program" className={styles.secondaryBtn}>
          All projects
        </Link>
      </div>
    </div>
  );
}

function EnrolledView({
  project,
  handle,
  stats,
  prevSlug,
  nextSlug,
  getIdToken,
  descriptionText,
}: {
  project: ProgramProject;
  handle: string;
  stats: CohortStats | null;
  prevSlug?: string;
  nextSlug?: string;
  getIdToken: () => Promise<string | null>;
  descriptionText: string;
}) {
  const org = cohortOrg();
  const p = (text: string) => personalizeProgramText(text, handle, org, stats);
  const agentPrompt = buildProjectAgentPrompt(project, handle, org, stats);
  const { survey, loading: surveyLoading } = useSurveyState(getIdToken, true);
  const gate = projectSurveyGate(project.slug, survey);
  const surveyReady = !(surveyLoading && survey === null);
  const progressEnabled = surveyReady && !gate.locked;
  const { progress, loading: progressLoading, error: progressError, refresh: refreshProgress } =
    useProjectProgress(project.slug, getIdToken, progressEnabled);

  if (!surveyReady) {
    return (
      <>
        <ProgramDescription text={descriptionText} />
        <p className={styles.formNote}>Loading your participant view…</p>
      </>
    );
  }

  const peerReviewShell = project.reviews ? (
    progress && progressEnabled ? (
      <PeerRatingBoard
        projectSlug={project.slug}
        progress={progress}
        reviewerHandle={handle}
        getIdToken={getIdToken}
        onUpdated={() => void refreshProgress()}
      />
    ) : (
      <ProjectPeerReviewSection
        project={project}
        p={p}
        stats={stats}
        variant="enrolled"
        lockNotice={
          gate.locked
            ? 'Complete the research survey (or decline participation) to load your peer list and unlock voting.'
            : progressLoading
              ? 'Loading your peer list…'
              : progressError
                ? progressError
                : 'Your peer list loads here once progress is available.'
        }
      />
    )
  ) : null;

  if (gate.locked) {
    return (
      <>
        <ProgramDescription text={descriptionText} />
        <SurveyGateNotice project={project} gate={gate} />
        <div className={styles.participantPanel}>
          <p className={styles.formNote} style={{ marginTop: 0 }}>
            Requirements and the peer review section are visible now. Submission tracking and the
            peer list load after you complete the survey (or decline participation).
          </p>
          <ProjectRequirementsSections
            project={project}
            p={p}
            stats={stats}
            variant="enrolled"
          />
          {peerReviewShell}
        </div>
      </>
    );
  }

  return (
    <>
    <ProgramDescription text={descriptionText} />
    <div className={styles.participantPanel}>
      <div className={styles.participantBanner}>
        <p className={styles.participantBannerEyebrow}>
          Enrolled · Summer Pilot 2026 · @{handle}
          {stats && stats.enrolledCount > 0 ? ` · Cohort ${stats.enrolledCount}` : ''}
        </p>
        <p className={styles.participantBannerLead}>
          {project.voteWeek ? (
            <>
              <strong>{project.phaseLabel}</strong> — contest week with peer review. Build
              individually, file written reviews on every other participant
              {stats && stats.peerReviewCount > 0 ? ` (${stats.peerReviewCount} reviews)` : ''},
              and submit a merged pull request before the deadline.
            </>
          ) : (
            <>
              <strong>{project.phaseLabel}</strong> — {project.weeks}. Review requirements now;
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

      {progress?.outcome ? (
        <ProjectOutcomeBanner outcome={progress.outcome} viewerHandle={handle} />
      ) : null}

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

      {peerReviewShell}

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
    </>
  );
}

function ApplicantInFlightBanner() {
  return (
    <div className={styles.callout}>
      <p>
        <strong>Application under review</strong> — complete your take-home pull request.{' '}
        <Link href="/dashboard">Return to dashboard →</Link>
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
        <code>{'{handle}'}</code> are replaced after enrollment.
        {stats && stats.enrolledCount > 0 ? (
          <>
            {' '}
            Current cohort: <strong>{stats.enrolledCount}</strong> enrolled (
            {stats.peerReviewCount} peer reviews per Phase 1 project).
          </>
        ) : (
          <> Peer review counts update as the cohort roster is finalized.</>
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
        <ProjectPeerReviewSection
          project={project}
          p={p}
          stats={stats}
          variant="public"
          lockNotice="Sign in as an enrolled participant to load your peer list and cast votes. Until then, this section explains the review flow only."
        />
      )}

      {project.voteWeek && (
        <section className={styles.overviewBlock}>
          <h2>Selection criteria</h2>
          <p>{WINNER_SELECTION_PUBLIC}</p>
        </section>
      )}
    </>
  );
}

export function ProgramProjectView({ project, prevSlug, nextSlug, initialStats = null }: Props) {
  const { profile, loading: authLoading, getIdToken } = useGithubAuth();
  const { me, loading: statusLoading } = useParticipantStatus(getIdToken, Boolean(profile));

  const loading = authLoading || (Boolean(profile) && statusLoading);
  const enrolled = isEnrolled(me);
  const inFlight = isApplicantInFlight(me);
  const pendingRoster = isAdmittedPendingRoster(me);
  const handle = me?.githubHandle;
  const stats = me?.cohortStats ?? initialStats;
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
            <strong>Admitted — enrollment pending.</strong> Your application has been approved.
            Participant progress will become available once staff confirm your enrollment. Contact{' '}
            <a href="mailto:cohort@hult.edu">cohort@hult.edu</a> if this status persists.
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
      <EnrolledView
        project={project}
        handle={handle}
        stats={stats}
        prevSlug={prevSlug}
        nextSlug={nextSlug}
        getIdToken={getIdToken}
        descriptionText={descriptionText}
      />
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
