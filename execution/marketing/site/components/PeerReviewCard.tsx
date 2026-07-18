'use client';

import type { PeerRatingTarget } from '@/lib/project-progress-types';
import { newReviewIssueUrl } from '@/lib/written-reviews-format';
import { VOTE_NOTE } from '@/lib/review-week-copy';
import styles from '../app/page.module.css';

type Status = 'needs-review' | 'reviewed' | 'upvoted';

function peerStatus(peer: PeerRatingTarget): Status {
  if (peer.upvoted) return 'upvoted';
  if (peer.reviewFiled) return 'reviewed';
  return 'needs-review';
}

const STATUS_LABEL: Record<Status, string> = {
  'needs-review': 'Needs review',
  reviewed: 'Reviewed (abstained)',
  upvoted: 'Upvoted',
};

type CardProps = {
  peer: PeerRatingTarget;
  reviewerHandle: string;
  reviewWindowOpen: boolean;
  reviewWindowStatus: 'none' | 'not-yet' | 'open' | 'closed';
  reviewOpensFormatted?: string;
  reviewClosesFormatted?: string;
  expanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
};

export function PeerReviewCard({
  peer,
  reviewerHandle,
  reviewWindowOpen,
  reviewWindowStatus,
  reviewOpensFormatted,
  reviewClosesFormatted,
  expanded,
  onToggle,
  onRefresh,
  refreshing = false,
}: CardProps) {
  const status = peerStatus(peer);
  const bodyId = `peer-review-body-${peer.handle}`;

  return (
    <div className={`${styles.peerReviewCard} ${expanded ? styles.peerReviewCardOpen : ''}`}>
      <button
        type="button"
        className={styles.peerReviewCardHeader}
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={bodyId}
      >
        <span className={styles.peerReviewCardHandle}>@{peer.handle}</span>
        <span
          className={`${styles.peerStatusBadge} ${styles[`peerStatus_${status === 'upvoted' ? 'complete' : status === 'reviewed' ? 'ready-to-vote' : 'needs-review'}`]}`}
        >
          {STATUS_LABEL[status]}
        </span>
        <span className={styles.peerReviewCardChevron} aria-hidden>
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded ? (
        <div className={styles.peerReviewCardBody} id={bodyId}>
          <ol className={styles.reviewStepList}>
            <li className={styles.reviewStep}>
              <div className={styles.reviewStepTitle}>
                <span className={styles.reviewStepNum}>1</span>
                Evaluate their deployment
              </div>
              {peer.deployUrl ? (
                <a
                  href={peer.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.reviewActionBtn}
                >
                  Open deployment →
                </a>
              ) : (
                <p className={styles.reviewStepHint}>
                  No deployment URL on file — refer to their pull request and README.
                </p>
              )}
            </li>

            <li className={styles.reviewStep}>
              <div className={styles.reviewStepTitle}>
                <span className={styles.reviewStepNum}>2</span>
                Read their submission pull request
              </div>
              <a
                href={peer.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.reviewActionBtn}
              >
                Open submission pull request →
              </a>
            </li>

            <li className={styles.reviewStep}>
              <div className={styles.reviewStepTitle}>
                <span className={styles.reviewStepNum}>3</span>
                File review on GitHub (optional upvote)
              </div>
              {reviewWindowStatus === 'not-yet' && reviewOpensFormatted ? (
                <p className={styles.reviewWindowNotice}>
                  <strong>Review week opens {reviewOpensFormatted}.</strong> You may browse their
                  deployment and pull request now.
                </p>
              ) : null}
              {reviewWindowStatus === 'closed' ? (
                <p className={styles.reviewWindowNotice}>
                  <strong>Review week is closed</strong>
                  {reviewClosesFormatted ? ` (${reviewClosesFormatted})` : ''}.
                </p>
              ) : null}

              {peer.reviewIssueUrl ? (
                <div className={styles.reviewStepDone}>
                  <span className={styles.reviewStepCheck}>✓</span>
                  <span>
                    Review found ·{' '}
                    <a href={peer.reviewIssueUrl} target="_blank" rel="noopener noreferrer">
                      view GitHub issue
                    </a>
                    {peer.upvoted ? ' · upvoted' : ' · abstained'}
                  </span>
                </div>
              ) : (
                <>
                  <a
                    href={newReviewIssueUrl(peer.repo, reviewerHandle, peer.handle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.reviewActionBtn}
                  >
                    {reviewWindowOpen
                      ? 'File review + optional upvote on GitHub →'
                      : 'Preview GitHub issue template →'}
                  </a>
                  <p className={styles.reviewStepHint}>
                    Opens <code>{peer.repo}</code> with title{' '}
                    <code>
                      Review by @{reviewerHandle}: @{peer.handle}
                    </code>
                    . Keep <code>Vote: up</code> to upvote, or delete that section to abstain.
                  </p>
                </>
              )}

              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={onRefresh}
                disabled={refreshing}
                aria-busy={refreshing}
              >
                {refreshing ? 'Refreshing…' : 'Refresh status'}
              </button>
              <p className={styles.reviewStepHint}>
                Status may take up to a minute to update after you file or edit the GitHub issue.
              </p>
              <p className={styles.reviewStepHint}>{VOTE_NOTE}</p>
            </li>
          </ol>
        </div>
      ) : null}
    </div>
  );
}
