import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import styles from '../app/page.module.css';

export type NavLink = { href: string; label: string; cta?: boolean };

/** Same primary links on every page. The logo is Home. Current page is marked in SiteNav. */
export const defaultHeaderLinks: NavLink[] = [
  { href: '/program', label: 'Program' },
  { href: '/overview', label: 'Overview' },
  { href: '/winning-guide', label: 'Winning guide' },
];

type Props = {
  links?: NavLink[];
  children: ReactNode;
};

export function PageFrame({ links = defaultHeaderLinks, children }: Props) {
  return (
    <main className={styles.main}>
      <SiteHeader links={links} />
      <div id="page-content">{children}</div>
    </main>
  );
}
