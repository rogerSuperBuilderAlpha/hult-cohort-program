'use client';

import Link from 'next/link';
import type { ProgramProject } from '@/content/program';
import { AgentPromptHarness } from '@/components/AgentPromptHarness';
import { cohortOrg, cohortOrgUrl } from '@/lib/cohort-config';
import { useGithubAuth } from '@/lib/firebase/use-github-auth';
import { buildProjectAgentPrompt, buildPublicAgentPrompt } from '@/lib/project-agent-prompt';
import { isAdmitted } from '@/lib/participant-status';
import { personalizeProgramText } from '@/lib/personalize-program';
import { useParticipantStatus } from '@/lib/use-participant-status';
import styles from '../app/page.module.css';

type Props = {
  project: ProgramProject;
  prevSlug?: string;
  nextSlug?: string;
};

function EnrolledView({
  project,
  handle,
  prevSlug,
  nextSlug,
}: {
  project: ProgramProject;
  handle: string;
  prevSlug?: string;
  nextSlug?: string;
}) {
  const org = cohortOrg();
  const p = (text: string) => personalizeProgramText(text, handle, org);
  const isOnboarding = project.slug === 'onboarding';
  const agentPrompt = buildProjectAgentPrompt(project, handle, org);

  return (
    <div className={styles.participantPanel}>
      <div className={styles.participantBanner}>
        <p className={styles.participantBannerEyebrow}>Enrolled · Fall 2026 · @{handle}</p>
        <p className={styles.participantBannerLead}>
          {isOnboarding ? (
            <>
              <strong>{project.phaseLabel}</strong> — your active week. Complete the checklist and
              open your onboarding PR in the cohort roster repo.
            </>
          ) : project.voteWeek ? (
            <>
              <strong>{project.phaseLabel}</strong> — contest project with a vote week. Build solo,
              review 29 peers, submit a merged PR before the deadline.
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
          <strong>Vote week.</strong> After reviews, rank your top 3 merged submission PRs. You
          cannot rank your own PR. Voting UI opens during review week (enrolled participants only).
        </div>
      )}

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

      {project.reviews && (
        <section className={styles.overviewBlock}>
          <h2 className={styles.participantHeading}>Peer review</h2>
          <p>
            <strong>{project.reviews.count}</strong> mandatory reviews. Artifact:{' '}
            {p(project.reviews.artifact)}. Due: {project.reviews.dueNote}.
          </p>
        </section>
      )}

      <section className={styles.overviewBlock}>
        <h2 className={styles.participantHeading}>Pass gate</h2>
        <ul className={styles.onboardingChecklist}>
          {project.passGate.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
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

function PublicView({ project }: { project: ProgramProject }) {
  const agentPrompt = buildPublicAgentPrompt(project);

  return (
    <>
      <p className={styles.formNote} style={{ marginTop: 0 }}>
        Template placeholders <code>{'{org}'}</code> and <code>{'{handle}'}</code> are replaced with
        your cohort org and GitHub handle after you enroll.{' '}
        <Link href="/apply">Sign in to apply</Link>.
      </p>

      {project.voteWeek && (
        <div className={styles.callout}>
          <strong>Vote week.</strong> After review, rank your top 3 merged submission PRs on the
          platform. You cannot rank your own PR.
        </div>
      )}

      <section className={styles.overviewBlock}>
        <h2>What is expected of you</h2>
        <ul>
          {project.expectations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className={styles.overviewBlock}>
        <h2>How you submit (PR, not a link form)</h2>
        <dl className={styles.dl}>
          <dt>Repo</dt>
          <dd>
            <code>{project.submission.repoPattern}</code>
          </dd>
          <dt>PR title</dt>
          <dd>
            <code>{project.submission.prTitle}</code>
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
            <strong>{project.reviews.count}</strong> mandatory reviews. Artifact:{' '}
            {project.reviews.artifact}. Due: {project.reviews.dueNote}.
          </p>
        </section>
      )}

      <section className={styles.overviewBlock}>
        <h2>Pass gate</h2>
        <ul>
          {project.passGate.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {project.voteWeek && (
        <section className={styles.overviewBlock}>
          <h2>Voting</h2>
          <p>
            Ballot lists every <strong>merged submission PR</strong> that passed the eligibility
            checklist. Rank your top 3. Ballots are private; aggregate results published after the
            winner is announced.
          </p>
        </section>
      )}
    </>
  );
}

export function ProgramProjectView({ project, prevSlug, nextSlug }: Props) {
  const { profile, loading: authLoading, getIdToken } = useGithubAuth();
  const { me, loading: statusLoading } = useParticipantStatus(getIdToken, Boolean(profile));

  const loading = authLoading || (Boolean(profile) && statusLoading);
  const admitted = isAdmitted(me);
  const handle = me?.githubHandle;

  if (loading) {
    return <p className={styles.formNote}>Loading your participant view…</p>;
  }

  if (admitted && profile && handle) {
    return (
      <EnrolledView
        project={project}
        handle={handle}
        prevSlug={prevSlug}
        nextSlug={nextSlug}
      />
    );
  }

  return <PublicView project={project} />;
}
