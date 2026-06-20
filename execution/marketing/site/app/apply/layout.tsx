import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply | Hult Cohort Developer Program',
  description:
    'Apply for the Fall 2026 cohort — application form, 48-hour GitHub take-home, decision within 48 hours of your pull request.',
  openGraph: {
    title: 'Apply — Hult Cohort Developer Program',
    description:
      'Fall 2026 application — complete the form and submit a take-home pull request within 48 hours.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
