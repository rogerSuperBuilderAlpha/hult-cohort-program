import type { Metadata } from 'next';
import { IBM_Plex_Mono, Instrument_Serif, Source_Sans_3 } from 'next/font/google';
import { positioning } from '@/data/cohort';
import './globals.css';

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const body = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(positioning.productionDomain),
  title: {
    default: 'Hult Cohort · Capability in public',
    template: '%s · Hult Cohort',
  },
  description:
    'Summer Pilot 2026 — deployable software against Global South infrastructure problems, built in public.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body min-h-screen">{children}</body>
    </html>
  );
}
