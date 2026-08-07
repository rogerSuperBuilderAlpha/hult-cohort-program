import Link from 'next/link';
import styles from '../app/page.module.css';

type Props = {
  subtitle?: string;
};

export function HultLogo({ subtitle = 'Developer Program' }: Props) {
  return (
    <Link href="/" className={styles.logo}>
      <span className={styles.logoMark}>Hult</span>
      <span className={styles.logoSub}>{subtitle}</span>
    </Link>
  );
}
