import Image from 'next/image';
import Link from 'next/link';
import styles from '../app/page.module.css';

type Props = {
  subtitle?: string;
};

export function HultLogo({ subtitle = 'Developer Program' }: Props) {
  return (
    <Link href="/" className={styles.logo}>
      <Image
        src="/brand/hult-logo-black.svg"
        alt="Hult"
        width={140}
        height={77}
        className={styles.logoImage}
        priority
        unoptimized
      />
      <span className={styles.logoSub}>{subtitle}</span>
    </Link>
  );
}
