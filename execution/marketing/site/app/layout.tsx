import type { Metadata } from 'next';
import { FirebaseAnalytics } from '@/components/FirebaseAnalytics';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hult Cohort Developer Program | GitHub-Native Training',
  description:
    'One semester. Six production projects. Unlimited cohorts on one fee. Every skill verifiable on GitHub. Apply Fall 2026.',
  openGraph: {
    title: 'Hult Cohort Developer Program',
    description: 'Ship six production projects. Get a job offer — or come back free until you do.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
