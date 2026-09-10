import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply | Hult Cohort Developer Program',
  description:
    'Apply for the Fall 2026 cohort — application form, 48-hour technical take-home, and production software assessment.',
  openGraph: {
    title: 'Apply — Hult Cohort Developer Program',
    description:
      'Fall 2026 application — complete the form and technical take-home for a production software cohort.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
