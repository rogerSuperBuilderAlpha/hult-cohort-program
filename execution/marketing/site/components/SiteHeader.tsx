import { HultLogo } from '@/components/HultLogo';
import { SiteNav } from '@/components/SiteNav';
import styles from '../app/page.module.css';

type NavLink = { href: string; label: string; cta?: boolean };

type Props = {
  links?: NavLink[];
  subtitle?: string;
};

export function SiteHeader({ links, subtitle }: Props) {
  return (
    <header className={styles.header}>
      <HultLogo subtitle={subtitle} />
      <SiteNav links={links} />
    </header>
  );
}
