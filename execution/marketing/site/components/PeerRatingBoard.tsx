'use client';

import { useCallback, useState } from 'react';
import { PeerReviewCard } from '@/components/PeerReviewCard';
import { authedFetch } from '@/lib/authed-fetch';
import { REVIEW_HOW_TO, WINNER_NOTE } from '@/lib/review-week-copy';
import type { ProjectProgress, PeerRating, PeerRatingTarget } from '@/lib/project-progress-types';
import styles from '../app/page.module.css';

const INITIAL_VISIBLE = 8;

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

      try {
        await authedFetch(
          getIdToken,
          `/api/program/${projectSlug}/ratings`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ revieweeHandle: peer.handle, rating }),
          },
          'Could not save vote.'
        );
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
        <h2 className={styles.participantHeading}>Peer review and voting</h2>
        <div className={styles.callout}>
          <p>
            <strong>No eligible peers yet.</strong>{' '}
            {awaitingMerge > 0
              ? `${awaitingMerge} enrolled peer(s) have not merged a submission pull request. Pass criteria count only peers with merged submissions — check back as pull requests are merged.`
              : 'Review week will begin once peers merge their submission pull requests.'}
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
      <h2 className={styles.participantHeading}>Peer review and voting</h2>

      {reviewWindowStatus === 'not-yet' && reviewOpensFormatted ? (
        <div className={styles.callout}>
          <p>
            <strong>Review week opens {reviewOpensFormatted}.</strong> You may browse peer
            repositories now; written reviews and private votes become available when the window
            opens.
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
        <p className={styles.reviewHowToLead}>{REVIEW_HOW_TO}</p>
        {voteWeek ? (
          <p className={styles.privacyNote}>
            <strong>Selection:</strong> {WINNER_NOTE}
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
        title={`Pending (${inProgress.length})`}
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
            Complete ({complete.length}) — expand to view
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
