import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply | Hult Cohort Developer Program',
  description:
    'Apply for Fall 2026 — short application, 48-hour GitHub take-home, decision within 48 hours of your PR.',
  openGraph: {
    title: 'Apply — Hult Cohort Developer Program',
    description:
      'Fall 2026 application — 48-hour GitHub take-home, decision within 48 hours of your PR.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
