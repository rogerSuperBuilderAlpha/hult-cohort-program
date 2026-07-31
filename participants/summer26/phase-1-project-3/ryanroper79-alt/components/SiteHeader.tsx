import Link from 'next/link';
import Image from 'next/image';
import { positioning } from '@/data/cohort';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/partners', label: 'Partners' },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-ceal-line bg-ceal-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 focus-ring rounded-md">
          <Image
            src={positioning.brand.logoPath}
            alt="CEAL Green"
            width={40}
            height={40}
          />
          <span className="font-display text-lg text-ceal-mangrove">Hult Cohort</span>
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm font-medium text-ceal-mangrove">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ceal-leaf focus-ring rounded">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
