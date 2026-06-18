'use client';

import { useCallback, useState } from 'react';
import type { ProgramProject } from '@/content/program';
import { PeerReviewCard } from '@/components/PeerReviewCard';
import type { ProjectProgress, PeerRating, PeerRatingTarget } from '@/lib/project-progress-types';
import styles from '../app/page.module.css';

const INITIAL_VISIBLE = 8;

function StatusIcon({ done }: { done: boolean }) {
  return (
    <span className={done ? styles.progressIconDone : styles.progressIconPending} aria-hidden>
      {done ? '✓' : '○'}
    </span>
  );
}

function whatsLeft(_project: ProgramProject, progress: ProjectProgress): string {
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
  progress: ProjectProgress;
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
      <p className={styles.progressSummary}>{whatsLeft(project, progress)}</p>

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

function PeerReviewSection({
  title,
  peers,
  projectSlug,
  reviewerHandle,
  getIdToken,
  onUpdated,
  githubVerification,
  reviewWindowOpen,
  reviewWindowStatus,
  reviewOpensFormatted,
  reviewClosesFormatted,
  expandedHandle,
  onExpand,
  savingVote,
  onVote,
  initialVisible = INITIAL_VISIBLE,
}: {
  title: string;
  peers: PeerRatingTarget[];
  projectSlug: string;
  reviewerHandle: string;
  getIdToken: () => Promise<string | null>;
  onUpdated: () => void;
  githubVerification: boolean;
  reviewWindowOpen: boolean;
  reviewWindowStatus: 'none' | 'not-yet' | 'open' | 'closed';
  reviewOpensFormatted?: string;
  reviewClosesFormatted?: string;
  expandedHandle: string | null;
  onExpand: (handle: string | null) => void;
  savingVote: string | null;
  onVote: (peer: PeerRatingTarget, rating: PeerRating) => void;
  initialVisible?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  if (peers.length === 0) return null;

  const visible = showAll ? peers : peers.slice(0, initialVisible);
  const hiddenCount = peers.length - initialVisible;

  return (
    <>
      <h3 className={styles.progressSubheading}>{title}</h3>
      <div className={styles.peerReviewList}>
        {visible.map((peer) => (
          <PeerReviewCard
            key={peer.handle}
            peer={peer}
            projectSlug={projectSlug}
            reviewerHandle={reviewerHandle}
            getIdToken={getIdToken}
            onUpdated={onUpdated}
            githubVerification={githubVerification}
            reviewWindowOpen={reviewWindowOpen}
            reviewWindowStatus={reviewWindowStatus}
            reviewOpensFormatted={reviewOpensFormatted}
            reviewClosesFormatted={reviewClosesFormatted}
            expanded={expandedHandle === peer.handle}
            onToggle={() => onExpand(expandedHandle === peer.handle ? null : peer.handle)}
            savingVote={savingVote === peer.handle}
            onVote={onVote}
          />
        ))}
      </div>
      {!showAll && hiddenCount > 0 ? (
        <button type="button" className={styles.showMoreBtn} onClick={() => setShowAll(true)}>
          Show {hiddenCount} more
        </button>
      ) : null}
    </>
  );
}

type RatingBoardProps = {
  projectSlug: string;
  progress: ProjectProgress;
  reviewerHandle: string;
  getIdToken: () => Promise<string | null>;
  onUpdated: () => void;
};

export function PeerRatingBoard({
  projectSlug,
  progress,
  reviewerHandle,
  getIdToken,
  onUpdated,
}: RatingBoardProps) {
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [expandedHandle, setExpandedHandle] = useState<string | null>(null);

  const reviews = progress.reviews;
  const reviewWindowOpen =
    reviews?.reviewWindowStatus === 'open' || reviews?.reviewWindowStatus === 'none';

  const submitRating = useCallback(
    async (peer: PeerRatingTarget, rating: PeerRating) => {
      if (!peer.reviewFiled || !reviewWindowOpen) return;

      setSaving(peer.handle);
      setError('');

      const idToken = await getIdToken();
      if (!idToken) {
        setError('Sign in again to save votes.');
        setSaving(null);
        return;
      }

      try {
        const res = await fetch(`/api/program/${projectSlug}/ratings`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ revieweeHandle: peer.handle, rating }),
        });
        const json = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(json.error || 'Could not save vote.');
        onUpdated();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save vote.');
      } finally {
        setSaving(null);
      }
    },
    [getIdToken, onUpdated, projectSlug, reviewWindowOpen]
  );

  if (!reviews) return null;

  const {
    peers,
    orgReposUrl,
    voteWeek,
    required,
    writtenCompleted,
    ratingsCompleted,
    githubVerification,
    awaitingMerge,
    reviewWindowStatus,
    reviewOpensFormatted,
    reviewClosesFormatted,
  } = reviews;

  if (peers.length === 0) {
    return (
      <section className={styles.overviewBlock} id="peer-ratings">
        <h2 className={styles.participantHeading}>Review &amp; vote on peer builds</h2>
        <div className={styles.callout}>
          <p>
            <strong>No eligible peers yet.</strong>{' '}
            {awaitingMerge > 0
              ? `${awaitingMerge} enrolled peer(s) have not merged a submission PR yet. Your pass gate counts only peers with merged submissions — check back as PRs land.`
              : 'Waiting for peers to merge submission PRs before review week can begin.'}
          </p>
          <p className={styles.formNote} style={{ marginBottom: 0 }}>
            <a href={orgReposUrl} target="_blank" rel="noopener noreferrer">
              Browse cohort repos →
            </a>
          </p>
        </div>
      </section>
    );
  }

  const needsReview = peers.filter((p) => !p.reviewFiled);
  const readyToVote = peers.filter((p) => p.reviewFiled && !p.rated);
  const complete = peers.filter((p) => p.reviewFiled && p.rated);
  const inProgress = [...needsReview, ...readyToVote];

  return (
    <section className={styles.overviewBlock} id="peer-ratings">
      <h2 className={styles.participantHeading}>Review &amp; vote on peer builds</h2>

      {reviewWindowStatus === 'not-yet' && reviewOpensFormatted ? (
        <div className={styles.callout}>
          <p>
            <strong>Review week opens {reviewOpensFormatted}.</strong> You can browse peer repos
            now, but written reviews and private votes unlock when the window opens.
          </p>
        </div>
      ) : null}
      {reviewWindowStatus === 'closed' ? (
        <div className={styles.callout}>
          <p>
            <strong>Review week is closed</strong>
            {reviewClosesFormatted ? ` (${reviewClosesFormatted})` : ''}. No new reviews or votes
            can be filed.
          </p>
        </div>
      ) : null}

      <div className={styles.reviewHowTo}>
        <p className={styles.reviewHowToLead}>
          Work through one peer at a time. For each peer: try their deploy → read their PR → file a
          written review (GitHub issue) → cast a private 👍/👎 (vote unlocks after the review is
          saved).
        </p>
        {voteWeek ? (
          <p className={styles.privacyNote}>
            <strong>Winner:</strong> most thumbs up after review week. Live vote totals are never
            shown during the week.
          </p>
        ) : null}
      </div>

      <div className={styles.reviewProgressBar}>
        <span>
          Reviews <strong>{writtenCompleted}/{required}</strong>
        </span>
        <span>
          Votes <strong>{ratingsCompleted}/{required}</strong>
        </span>
        <a href={orgReposUrl} target="_blank" rel="noopener noreferrer">
          All cohort repos →
        </a>
      </div>

      {error ? <p className={styles.formError}>{error}</p> : null}

      <PeerReviewSection
        title={`To do (${inProgress.length})`}
        peers={inProgress}
        projectSlug={projectSlug}
        reviewerHandle={reviewerHandle}
        getIdToken={getIdToken}
        onUpdated={onUpdated}
        githubVerification={githubVerification}
        reviewWindowOpen={reviewWindowOpen}
        reviewWindowStatus={reviewWindowStatus}
        reviewOpensFormatted={reviewOpensFormatted}
        reviewClosesFormatted={reviewClosesFormatted}
        expandedHandle={expandedHandle}
        onExpand={setExpandedHandle}
        savingVote={saving}
        onVote={(peer, rating) => void submitRating(peer, rating)}
      />

      {complete.length > 0 ? (
        <details className={styles.peerReviewCompleteDetails}>
          <summary className={styles.peerReviewCompleteSummary}>
            Complete ({complete.length}) — click to expand
          </summary>
          <div className={styles.peerReviewList}>
            {complete.map((peer) => (
              <PeerReviewCard
                key={peer.handle}
                peer={peer}
                projectSlug={projectSlug}
                reviewerHandle={reviewerHandle}
                getIdToken={getIdToken}
                onUpdated={onUpdated}
                githubVerification={githubVerification}
                reviewWindowOpen={reviewWindowOpen}
                reviewWindowStatus={reviewWindowStatus}
                reviewOpensFormatted={reviewOpensFormatted}
                reviewClosesFormatted={reviewClosesFormatted}
                expanded={expandedHandle === peer.handle}
                onToggle={() =>
                  setExpandedHandle(expandedHandle === peer.handle ? null : peer.handle)
                }
                savingVote={saving === peer.handle}
                onVote={(p, rating) => void submitRating(p, rating)}
              />
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}
