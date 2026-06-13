import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply | Hult Cohort Developer Program',
  description:
    'Apply for Fall 2026 — short application, 48-hour GitHub take-home, decision within two weeks.',
  openGraph: {
    title: 'Apply — Hult Cohort Developer Program',
    description: 'Fall 2026 cohort application and admissions take-home.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
