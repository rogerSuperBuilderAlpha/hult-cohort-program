'use client';

import { useState } from 'react';
import type { PeerRating, PeerRatingTarget } from '@/lib/project-progress-types';
import { newReviewIssueUrl } from '@/lib/written-reviews-format';
import styles from '../app/page.module.css';

type Status = 'needs-review' | 'ready-to-vote' | 'complete';

function peerStatus(peer: PeerRatingTarget): Status {
  if (peer.reviewFiled && peer.rated) return 'complete';
  if (peer.reviewFiled) return 'ready-to-vote';
  return 'needs-review';
}

const STATUS_LABEL: Record<Status, string> = {
  'needs-review': 'Needs review',
  'ready-to-vote': 'Ready to vote',
  complete: 'Complete',
};

function WrittenReviewForm({
  projectSlug,
  peer,
  reviewerHandle,
  getIdToken,
  onSaved,
  githubVerification,
  reviewWindowOpen,
  reviewWindowStatus,
  reviewOpensFormatted,
  reviewClosesFormatted,
}: {
  projectSlug: string;
  peer: PeerRatingTarget;
  reviewerHandle: string;
  getIdToken: () => Promise<string | null>;
  onSaved: () => void;
  githubVerification: boolean;
  reviewWindowOpen: boolean;
  reviewWindowStatus: 'none' | 'not-yet' | 'open' | 'closed';
  reviewOpensFormatted?: string;
  reviewClosesFormatted?: string;
}) {
  const [issueUrl, setIssueUrl] = useState(peer.reviewIssueUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!reviewWindowOpen) return;
    setSaving(true);
    setError('');
    const idToken = await getIdToken();
    if (!idToken) {
      setError('Sign in again.');
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`/api/program/${projectSlug}/written-reviews`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ revieweeHandle: peer.handle, issueUrl }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || 'Could not save review.');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save review.');
    } finally {
      setSaving(false);
    }
  };

  if (peer.reviewFiled && peer.reviewIssueUrl) {
    return (
      <div className={styles.reviewStepDone}>
        <span className={styles.reviewStepCheck}>✓</span>
        <span>
          Review saved ·{' '}
          <a href={peer.reviewIssueUrl} target="_blank" rel="noopener noreferrer">
            view GitHub issue
          </a>
        </span>
      </div>
    );
  }

  return (
    <div className={styles.reviewStepBody}>
      {reviewWindowStatus === 'not-yet' && reviewOpensFormatted ? (
        <p className={styles.reviewWindowNotice}>
          <strong>Review week opens {reviewOpensFormatted}.</strong> You can browse their repo and PR
          now; saving reviews and votes unlock when the window opens.
        </p>
      ) : null}
      {reviewWindowStatus === 'closed' ? (
        <p className={styles.reviewWindowNotice}>
          <strong>Review week is closed</strong>
          {reviewClosesFormatted ? ` (${reviewClosesFormatted})` : ''}. No new reviews or votes can
          be filed.
        </p>
      ) : null}
      <a
        href={newReviewIssueUrl(peer.repo, reviewerHandle)}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.reviewActionBtn}
      >
        Open GitHub issue template
      </a>
      <p className={styles.reviewStepHint}>
        Title must be <code>Review by @{reviewerHandle}</code> on their repo.
      </p>
      <label className={styles.reviewLinkLabel} htmlFor={`issue-${peer.handle}`}>
        Then paste the issue URL here:
      </label>
      <div className={styles.reviewLinkRow}>
        <input
          id={`issue-${peer.handle}`}
          type="url"
          className={styles.reviewLinkInput}
          placeholder={`https://github.com/${peer.repo}/issues/…`}
          value={issueUrl}
          onChange={(e) => setIssueUrl(e.target.value)}
        />
        <button
          type="button"
          className={
            saving || !issueUrl.trim() || !reviewWindowOpen
              ? styles.secondaryBtn
              : styles.primaryBtn
          }
          disabled={saving || !issueUrl.trim() || !reviewWindowOpen}
          onClick={() => void submit()}
        >
          {saving ? 'Saving…' : 'Save review'}
        </button>
      </div>
      {!reviewWindowOpen && reviewWindowStatus === 'not-yet' && reviewOpensFormatted ? (
        <p className={styles.reviewStepHint}>
          Save review unlocks {reviewOpensFormatted}.
        </p>
      ) : !reviewWindowOpen ? (
        <p className={styles.reviewStepHint}>Review week is not open — saving is disabled.</p>
      ) : null}
      {error ? <p className={styles.formError}>{error}</p> : null}
      {!githubVerification ? (
        <p className={styles.reviewStepHint}>Issue must be on @{peer.handle}&apos;s repo.</p>
      ) : null}
    </div>
  );
}

type CardProps = {
  peer: PeerRatingTarget;
  projectSlug: string;
  reviewerHandle: string;
  getIdToken: () => Promise<string | null>;
  onUpdated: () => void;
  githubVerification: boolean;
  reviewWindowOpen: boolean;
  reviewWindowStatus: 'none' | 'not-yet' | 'open' | 'closed';
  reviewOpensFormatted?: string;
  reviewClosesFormatted?: string;
  expanded: boolean;
  onToggle: () => void;
  savingVote: boolean;
  onVote: (peer: PeerRatingTarget, rating: PeerRating) => void;
};

export function PeerReviewCard({
  peer,
  projectSlug,
  reviewerHandle,
  getIdToken,
  onUpdated,
  githubVerification,
  reviewWindowOpen,
  reviewWindowStatus,
  reviewOpensFormatted,
  reviewClosesFormatted,
  expanded,
  onToggle,
  savingVote,
  onVote,
}: CardProps) {
  const status = peerStatus(peer);

  return (
    <div className={`${styles.peerReviewCard} ${expanded ? styles.peerReviewCardOpen : ''}`}>
      <button type="button" className={styles.peerReviewCardHeader} onClick={onToggle} aria-expanded={expanded}>
        <span className={styles.peerReviewCardHandle}>@{peer.handle}</span>
        <span className={`${styles.peerStatusBadge} ${styles[`peerStatus_${status}`]}`}>
          {STATUS_LABEL[status]}
        </span>
        <span className={styles.peerReviewCardChevron} aria-hidden>
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded ? (
        <div className={styles.peerReviewCardBody}>
          <ol className={styles.reviewStepList}>
            <li className={styles.reviewStep}>
              <div className={styles.reviewStepTitle}>
                <span className={styles.reviewStepNum}>1</span>
                Try their app
              </div>
              {peer.deployUrl ? (
                <a href={peer.deployUrl} target="_blank" rel="noopener noreferrer" className={styles.reviewActionBtn}>
                  Open live deploy →
                </a>
              ) : (
                <p className={styles.reviewStepHint}>No deploy URL on file — use their repo README.</p>
              )}
            </li>

            <li className={styles.reviewStep}>
              <div className={styles.reviewStepTitle}>
                <span className={styles.reviewStepNum}>2</span>
                Read their submission PR
              </div>
              <a href={peer.prUrl} target="_blank" rel="noopener noreferrer" className={styles.reviewActionBtn}>
                Open submission PR →
              </a>
            </li>

            <li className={styles.reviewStep}>
              <div className={styles.reviewStepTitle}>
                <span className={styles.reviewStepNum}>3</span>
                File written review (GitHub issue)
              </div>
              <WrittenReviewForm
                projectSlug={projectSlug}
                peer={peer}
                reviewerHandle={reviewerHandle}
                getIdToken={getIdToken}
                onSaved={onUpdated}
                githubVerification={githubVerification}
                reviewWindowOpen={reviewWindowOpen}
                reviewWindowStatus={reviewWindowStatus}
                reviewOpensFormatted={reviewOpensFormatted}
                reviewClosesFormatted={reviewClosesFormatted}
              />
            </li>

            <li className={`${styles.reviewStep} ${!peer.reviewFiled ? styles.reviewStepLocked : ''}`}>
              <div className={styles.reviewStepTitle}>
                <span className={styles.reviewStepNum}>4</span>
                Cast private vote
                {!peer.reviewFiled ? <span className={styles.reviewStepLockLabel}> — unlocks after step 3</span> : null}
              </div>
              <div className={styles.ratingActions}>
                <button
                  type="button"
                  className={`${styles.thumbBtn} ${peer.myRating === 'up' ? styles.thumbBtnActive : ''}`}
                  disabled={!peer.reviewFiled || savingVote || !reviewWindowOpen}
                  aria-pressed={peer.myRating === 'up'}
                  onClick={() => onVote(peer, 'up')}
                  title={
                    !reviewWindowOpen
                      ? 'Review week is not open'
                      : peer.reviewFiled
                        ? 'Thumbs up'
                        : 'File review first'
                  }
                >
                  👍 Thumbs up
                </button>
                <button
                  type="button"
                  className={`${styles.thumbBtn} ${styles.thumbBtnDown} ${peer.myRating === 'down' ? styles.thumbBtnActiveDown : ''}`}
                  disabled={!peer.reviewFiled || savingVote || !reviewWindowOpen}
                  aria-pressed={peer.myRating === 'down'}
                  onClick={() => onVote(peer, 'down')}
                  title={
                    !reviewWindowOpen
                      ? 'Review week is not open'
                      : peer.reviewFiled
                        ? 'Thumbs down'
                        : 'File review first'
                  }
                >
                  👎 Thumbs down
                </button>
              </div>
              {peer.reviewFiled ? (
                <p className={styles.reviewStepHint}>Only you see your vote. Peers cannot view it.</p>
              ) : null}
            </li>
          </ol>
        </div>
      ) : null}
    </div>
  );
}
