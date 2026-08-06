import Link from 'next/link';

export function Nav() {
  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/finder', label: 'Finder' },
    { href: '/watchlist', label: 'Watchlist' },
    { href: '/opportunities/new', label: 'Manual entry' },
  ];
  return (
    <nav className="flex flex-wrap gap-3 border-b border-ceal-500/15 pb-4 text-sm">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="font-medium text-ceal-700 hover:text-ceal-900 underline-offset-2 hover:underline">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
