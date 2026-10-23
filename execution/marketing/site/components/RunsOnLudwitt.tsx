import Link from 'next/link';
import {
  PITCHRISE_ALC_LINE,
  PITCHRISE_ALC_URL,
  PITCHRISE_DOCS_URL,
  PITCHRISE_TAGLINE,
  PITCHRISE_URL,
} from '@/content/pitchrise';
import styles from '../app/page.module.css';

type Layout = 'home' | 'intro' | 'overview';

/**
 * Short public note that the cohort runs on Ludwitt, tied to week 4
 * (learning integration). Pitchrise is the ALC process, not the platform.
 */
export function RunsOnLudwitt({
  layout = 'home',
  weekLink = true,
}: {
  layout?: Layout;
  /** Link to the week 4 project. Off on that project page itself. */
  weekLink?: boolean;
}) {
  const sectionClass =
    layout === 'intro'
      ? styles.introSection
      : layout === 'overview'
        ? styles.overviewBlock
        : styles.section;
  const headingClass =
    layout === 'intro'
      ? styles.introSectionTitle
      : layout === 'overview'
        ? undefined
        : styles.sectionTitle;

  return (
    <section className={sectionClass} aria-labelledby="runs-on-ludwitt">
      {layout === 'home' ? <div className={styles.sectionLabel}>Platform</div> : null}
      <h2 id="runs-on-ludwitt" className={headingClass}>
        Runs on Ludwitt
      </h2>
      <p className={styles.pitchriseBody}>
        This cohort runs on{' '}
        <a href={PITCHRISE_URL} target="_blank" rel="noopener noreferrer">
          Ludwitt
        </a>
        . {PITCHRISE_ALC_LINE}, is at{' '}
        <a href={PITCHRISE_ALC_URL} target="_blank" rel="noopener noreferrer">
          /alc
        </a>
        . Week 4 is the Ludwitt integration: a registered, working, instrumented learning app.
        {weekLink ? (
          <>
            {' '}
            <Link href="/program/phase-2-learning-app">Week 4 requirements</Link>.
          </>
        ) : null}
      </p>
      <p className={styles.pitchriseLinks}>
        <a href={PITCHRISE_URL} target="_blank" rel="noopener noreferrer">
          pitchrise.ludwitt.com
        </a>
        <a href={PITCHRISE_DOCS_URL} target="_blank" rel="noopener noreferrer">
          pitchrise.ludwitt.com/docs
        </a>
      </p>
      <p className={styles.pitchriseLine}>{PITCHRISE_TAGLINE}</p>
    </section>
  );
}
