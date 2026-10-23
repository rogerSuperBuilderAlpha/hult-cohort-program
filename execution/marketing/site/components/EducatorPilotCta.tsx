import { EDUCATOR_PILOT_CTA, PITCHRISE_URL } from '@/content/pitchrise';
import styles from '../app/page.module.css';

/** Educator action beside the student application. Opens Ludwitt. */
export function EducatorPilotCta({
  className,
}: {
  className?: string;
}) {
  return (
    <a
      href={PITCHRISE_URL}
      className={className ?? styles.secondaryBtn}
      target="_blank"
      rel="noopener noreferrer"
    >
      {EDUCATOR_PILOT_CTA}
    </a>
  );
}
