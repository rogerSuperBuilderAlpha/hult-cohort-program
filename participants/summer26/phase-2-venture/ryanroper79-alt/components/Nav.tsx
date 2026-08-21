import Link from 'next/link';
import { readSession } from '@/lib/ludwitt/session';

const links = [
  { href: '/', label: 'Home', auth: false },
  { href: '/bills', label: 'My Bills', auth: true },
  { href: '/calculator', label: 'Calculator', auth: true, highlight: true },
  { href: '/audit', label: 'Audit', auth: true },
  { href: '/recommendations', label: 'Recommendations', auth: true },
  { href: '/lighting', label: 'Lighting', auth: true },
  { href: '/equipment', label: 'Equipment', auth: true },
  { href: '/monitor', label: 'Monitor', auth: true },
  { href: '/venture', label: 'Venture', auth: false },
  { href: '/privacy', label: 'Privacy', auth: false },
];

export async function Nav() {
  const session = await readSession();
  return (
    <nav aria-label="Primary" className="flex flex-wrap gap-2 text-sm">
      {links
        .filter((l) => !l.auth || session)
        .map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full border px-3 py-1 transition ${
              'highlight' in l && l.highlight
                ? 'border-ceal-600 bg-ceal-600 font-semibold text-white hover:bg-ceal-700'
                : 'border-ceal-500/30 text-ceal-800 hover:bg-ceal-500/10'
            }`}
          >
            {l.label}
          </Link>
        ))}
      {!session ? (
        <Link
          href="/event/join?code=CEAL50-AUG15"
          className="rounded-full border border-emerald-600 px-3 py-1 font-semibold text-emerald-800 hover:bg-emerald-50"
        >
          Live session
        </Link>
      ) : null}
    </nav>
  );
}
