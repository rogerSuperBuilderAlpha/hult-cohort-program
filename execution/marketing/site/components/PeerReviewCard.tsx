'use client';

import type { PeerRatingTarget } from '@/lib/project-progress-types';
import { newReviewIssueUrl, reviewIssueTitle } from '@/lib/written-reviews-format';
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
  const issueTitle = reviewIssueTitle(reviewerHandle, peer.handle);

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
                File the review on GitHub
              </div>
              {reviewWindowStatus === 'not-yet' && reviewOpensFormatted ? (
                <p className={styles.reviewWindowNotice}>
                  <strong>Review week opens {reviewOpensFormatted}.</strong> You may browse their
                  deployment and pull request now. File the GitHub issue when the window opens.
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
                  <p className={styles.reviewStepHint}>
                    Reviews are <strong>GitHub issues</strong>, not a form on this site. The button
                    below opens the New Issue page on <code>{peer.repo}</code> with the correct title
                    and a review template already filled in.
                  </p>
                  <a
                    href={newReviewIssueUrl(peer.repo, reviewerHandle, peer.handle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.reviewActionBtn}
                  >
                    {reviewWindowOpen
                      ? 'Open GitHub → write review & submit issue'
                      : 'Preview GitHub issue template →'}
                  </a>
                  <p className={styles.reviewStepHint}>
                    <strong>On GitHub:</strong> leave the title as{' '}
                    <code>{issueTitle}</code>. Complete the rubric in the body. Then either keep the
                    line <code>Vote: up</code> (upvote) or delete the Vote section (abstain). Click{' '}
                    <strong>Submit new issue</strong> on GitHub to publish.
                  </p>
                </>
              )}

              <div className={styles.reviewStepTitle} style={{ marginTop: 16 }}>
                <span className={styles.reviewStepNum}>4</span>
                Refresh status here
              </div>
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
                After you submit (or edit) the issue on GitHub, return here and refresh. Status may
                take up to a minute to update. You should see Reviewed (abstained) or Upvoted —
                there is no separate “cast vote” button on this site.
              </p>
            </li>
          </ol>
        </div>
      ) : null}
    </div>
  );
}
