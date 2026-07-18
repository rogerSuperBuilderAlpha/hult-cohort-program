'use client';

import { useState } from 'react';
import { PeerReviewCard } from '@/components/PeerReviewCard';
import { REVIEW_HOW_TO, WINNER_NOTE } from '@/lib/review-week-copy';
import type { ProjectProgress, PeerRatingTarget } from '@/lib/project-progress-types';
import styles from '../app/page.module.css';

function PeerReviewSection({
  title,
  peers,
  reviewerHandle,
  onUpdated,
  reviewWindowOpen,
  reviewWindowStatus,
  reviewOpensFormatted,
  reviewClosesFormatted,
  expandedHandle,
  onExpand,
}: {
  title: string;
  peers: PeerRatingTarget[];
  reviewerHandle: string;
  onUpdated: () => void;
  reviewWindowOpen: boolean;
  reviewWindowStatus: 'none' | 'not-yet' | 'open' | 'closed';
  reviewOpensFormatted?: string;
  reviewClosesFormatted?: string;
  expandedHandle: string | null;
  onExpand: (handle: string | null) => void;
}) {
  if (peers.length === 0) return null;

  return (
    <>
      <h3 className={styles.progressSubheading}>{title}</h3>
      <div className={styles.peerReviewList}>
        {peers.map((peer) => (
          <PeerReviewCard
            key={peer.handle}
            peer={peer}
            reviewerHandle={reviewerHandle}
            reviewWindowOpen={reviewWindowOpen}
            reviewWindowStatus={reviewWindowStatus}
            reviewOpensFormatted={reviewOpensFormatted}
            reviewClosesFormatted={reviewClosesFormatted}
            expanded={expandedHandle === peer.handle}
            onToggle={() => onExpand(expandedHandle === peer.handle ? null : peer.handle)}
            onRefresh={onUpdated}
          />
        ))}
      </div>
    </>
  );
}

type RatingBoardProps = {
  progress: ProjectProgress;
  reviewerHandle: string;
  onUpdated: () => void;
};

export function PeerRatingBoard({
  progress,
  reviewerHandle,
  onUpdated,
}: RatingBoardProps) {
  const [expandedHandle, setExpandedHandle] = useState<string | null>(null);

  const reviews = progress.reviews;
  const reviewWindowOpen =
    reviews?.reviewWindowStatus === 'open' || reviews?.reviewWindowStatus === 'none';

  if (!reviews) return null;

  const {
    peers,
    orgReposUrl,
    voteWeek,
    required,
    writtenCompleted,
    upvotesCompleted,
    reviewWindowStatus,
    reviewOpensFormatted,
    reviewClosesFormatted,
  } = reviews;

  if (peers.length === 0) {
    return (
      <section className={styles.overviewBlock}>
        <h2 className={styles.participantHeading}>Peer review and voting</h2>
        <div className={styles.callout}>
          <p>
            <strong>No eligible peers yet.</strong>{' '}
            {reviews.awaitingMerge > 0
              ? `${reviews.awaitingMerge} enrolled peer(s) have not merged a submission pull request. Pass criteria count only peers with merged submissions — check back as pull requests are merged.`
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
  const reviewed = peers.filter((p) => p.reviewFiled && !p.upvoted);
  const upvoted = peers.filter((p) => p.upvoted);
  const inProgress = [...needsReview, ...reviewed];

  return (
    <section className={styles.overviewBlock}>
      <h2 className={styles.participantHeading}>Peer review and voting</h2>

      {reviewWindowStatus === 'not-yet' && reviewOpensFormatted ? (
        <div className={styles.callout}>
          <p>
            <strong>Review week opens {reviewOpensFormatted}.</strong> You may browse peer
            repositories now; file reviews on GitHub when the window opens, then refresh here.
          </p>
        </div>
      ) : null}
      {reviewWindowStatus === 'closed' ? (
        <div className={styles.callout}>
          <p>
            <strong>Review week is closed</strong>
            {reviewClosesFormatted ? ` (${reviewClosesFormatted})` : ''}.
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
          Upvotes <strong>{upvotesCompleted}/{required}</strong>
          <span className={styles.formNote}> (optional)</span>
        </span>
        <a href={orgReposUrl} target="_blank" rel="noopener noreferrer">
          All cohort repos →
        </a>
      </div>

      <PeerReviewSection
        title={`Pending (${inProgress.length})`}
        peers={inProgress}
        reviewerHandle={reviewerHandle}
        onUpdated={onUpdated}
        reviewWindowOpen={reviewWindowOpen}
        reviewWindowStatus={reviewWindowStatus}
        reviewOpensFormatted={reviewOpensFormatted}
        reviewClosesFormatted={reviewClosesFormatted}
        expandedHandle={expandedHandle}
        onExpand={setExpandedHandle}
      />

      {upvoted.length > 0 ? (
        <details className={styles.peerReviewCompleteDetails}>
          <summary className={styles.peerReviewCompleteSummary}>
            Upvoted ({upvoted.length}) — expand to view
          </summary>
          <div className={styles.peerReviewList}>
            {upvoted.map((peer) => (
              <PeerReviewCard
                key={peer.handle}
                peer={peer}
                reviewerHandle={reviewerHandle}
                reviewWindowOpen={reviewWindowOpen}
                reviewWindowStatus={reviewWindowStatus}
                reviewOpensFormatted={reviewOpensFormatted}
                reviewClosesFormatted={reviewClosesFormatted}
                expanded={expandedHandle === peer.handle}
                onToggle={() =>
                  setExpandedHandle(expandedHandle === peer.handle ? null : peer.handle)
                }
                onRefresh={onUpdated}
              />
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}
