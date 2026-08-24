import Link from 'next/link';
import { hackathonTrustabl } from '@/content/hackathon-trustabl';
import styles from '../app/page.module.css';

/** Site-wide strip for open hackathon tracks — visible to everyone, not roster-gated. */
export function PublicHackathonBanner() {
  const until = new Date(hackathonTrustabl.bannerVisibleUntil);
  if (Number.isNaN(until.getTime()) || Date.now() > until.getTime()) {
    return null;
  }

  return (
    <div className={styles.sessionBanner} role="status">
      <span className={styles.sessionBannerText}>
        <strong>Today: Trustabl hackathon track</strong>
        <span aria-hidden="true"> · </span>
        {hackathonTrustabl.event.when}
      </span>
      <Link className={styles.sessionBannerLink} href="/hackathon/trustabl">
        Contribution guide
      </Link>
      <a
        className={styles.sessionBannerSecondary}
        href={hackathonTrustabl.event.lumaUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Luma RSVP
      </a>
    </div>
  );
}
