import { HultLogo } from '@/components/HultLogo';
import { SiteNav } from '@/components/SiteNav';
import styles from '../app/page.module.css';

type NavLink = { href: string; label: string; cta?: boolean };

type Props = {
  links: NavLink[];
};

export function SiteHeader({ links }: Props) {
  return (
    <header className={styles.header}>
      <HultLogo />
      <SiteNav links={links} />
    </header>
  );
}
