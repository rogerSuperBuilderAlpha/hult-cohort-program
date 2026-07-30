import Link from 'next/link';
import type { ShowcaseProfile } from '@/lib/showcase/types';
import styles from '@/app/showcase/showcase.module.css';

type Props = {
  profile: ShowcaseProfile;
};

export function StudentCard({ profile }: Props) {
  if (profile.isPrivate) {
    return (
      <article className={styles.studentCard}>
        <div className={styles.avatarPlaceholder}>🔒</div>
        <h3>Private profile</h3>
        <p className={styles.muted}>This participant opted out of public marketing.</p>
      </article>
    );
  }

  const mergedCount = profile.submissions.filter((s) => s.merged).length;

  return (
    <Link href={`/students/${profile.handle}`} className={styles.studentCard}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={profile.photoUrl ?? undefined}
        alt=""
        width={72}
        height={72}
        className={styles.avatar}
      />
      <h3>{profile.displayName}</h3>
      <p className={styles.handle}>@{profile.handle}</p>
      {profile.campus ? <p className={styles.campus}>{profile.campus}</p> : null}
      <p className={styles.evidence}>
        {mergedCount > 0 ? `${mergedCount} merged submission${mergedCount === 1 ? '' : 's'}` : 'Profile live — evidence loading'}
      </p>
    </Link>
  );
}
