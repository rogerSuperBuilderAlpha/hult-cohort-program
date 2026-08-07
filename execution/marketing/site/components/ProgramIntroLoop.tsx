import styles from '../app/page.module.css';
import { phase1Loop } from '@/content/program-intro';

export function ProgramIntroLoop() {
  return (
    <div className={styles.introLoop} aria-label="Phase 1 project loop">
      {phase1Loop.map((item, i) => (
        <div key={item.step} className={styles.introLoopStep}>
          <div className={styles.introLoopArrow} aria-hidden={i === 0}>
            {i > 0 ? '→' : null}
          </div>
          <div className={styles.introLoopCard}>
            <span className={styles.introLoopNum}>{item.step}</span>
            <h3 className={styles.introLoopTitle}>{item.title}</h3>
            <p className={styles.introLoopBody}>{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
