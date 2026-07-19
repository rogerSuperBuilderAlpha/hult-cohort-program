import {
  REVIEW_HOW_TO_LEAD,
  REVIEW_HOW_TO_STEPS,
  WINNER_NOTE,
} from '@/lib/review-week-copy';
import styles from '../app/page.module.css';

type Props = {
  showWinnerNote?: boolean;
};

/** Full GitHub review + upvote walkthrough for the Peer review tab. */
export function ReviewHowTo({ showWinnerNote = false }: Props) {
  return (
    <div className={styles.reviewHowTo}>
      <p className={styles.reviewHowToLead}>
        <strong>How to leave a review and upvote</strong>
      </p>
      <p className={styles.reviewHowToSublead}>{REVIEW_HOW_TO_LEAD}</p>
      <ol className={styles.reviewHowToSteps}>
        {REVIEW_HOW_TO_STEPS.map((step, index) => (
          <li key={step.title} className={styles.reviewHowToStep}>
            <span className={styles.reviewHowToStepNum} aria-hidden>
              {index + 1}
            </span>
            <div>
              <strong className={styles.reviewHowToStepTitle}>{step.title}</strong>
              <p className={styles.reviewHowToStepBody}>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      {showWinnerNote ? (
        <p className={styles.privacyNote}>
          <strong>Selection:</strong> {WINNER_NOTE}
        </p>
      ) : null}
    </div>
  );
}
