import styles from '../app/page.module.css';
import { introTimeline } from '@/content/program-intro';

export function ProgramIntroTimeline() {
  return (
    <div className={styles.introTimeline} role="list" aria-label="Semester timeline">
      {introTimeline.map((seg, i) => (
        <div key={seg.id} className={styles.introTimelineItem} role="listitem">
          {i > 0 ? <div className={styles.introTimelineConnector} aria-hidden /> : null}
          <div className={styles.introTimelineNode}>
            <span className={styles.introTimelineWeeks}>{seg.weeks}</span>
            <strong className={styles.introTimelineLabel}>{seg.label}</strong>
            <p className={styles.introTimelineDetail}>{seg.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
