import type { Metadata } from 'next';
import { IBM_Plex_Mono, Instrument_Serif, Source_Sans_3 } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
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
    default: positioning.siteTitle,
    template: `%s · ${positioning.cohortMark}`,
  },
  description: positioning.subhead,
  openGraph: {
    title: positioning.siteTitle,
    description: positioning.headline,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="font-body min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
