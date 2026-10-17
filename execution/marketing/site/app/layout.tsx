import type { Metadata } from 'next';
import { Libre_Baskerville } from 'next/font/google';
import localFont from 'next/font/local';
import { AppProviders } from '@/components/AppProviders';
import { JsonLdOrganization } from '@/components/JsonLdOrganization';
import { SiteFooter } from '@/components/SiteFooter';
import { ConsentGate } from '@/components/ConsentGate';
import { metadataForPath } from '@/lib/page-metadata';
import {
  CANONICAL_SITE_ORIGIN,
  GITHUB_REPO_URL,
  METADATA_SITE_NAME,
} from '@/lib/site-config';
import './globals.css';

/** Hult display serif — same family used on hult.edu/go landing pages */
const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-hult-serif',
  display: 'swap',
});

/** Hult UI sans — EF Circular VF (Latin), matching hult.edu */
const efCircular = localFont({
  src: [
    {
      path: './fonts/EF-Circular-VF-Latin.woff2',
      style: 'normal',
      weight: '100 900',
    },
    {
      path: './fonts/EF-Circular-Italic-VF-Latin.woff2',
      style: 'italic',
      weight: '100 900',
    },
  ],
  variable: '--font-hult-sans',
  display: 'swap',
  fallback: ['Helvetica', 'Open Sans', 'Gill Sans MT', 'Gill Sans', 'Corbel', 'Arial', 'sans-serif'],
});

const homeMeta = metadataForPath('/');

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_ORIGIN),
  title: {
    default: METADATA_SITE_NAME,
    template: `%s | ${METADATA_SITE_NAME}`,
  },
  description: homeMeta.description,
  keywords: [
    'Algorithmacy Cohorts',
    'Ludwitt',
    'Hult',
    'developer cohort',
    'Fall 2026',
    'software engineering',
    'production software',
    'engineering practice',
  ],
  authors: [{ name: 'Hult International Business School' }],
  creator: METADATA_SITE_NAME,
  openGraph: {
    ...homeMeta.openGraph,
    locale: 'en_US',
  },
  twitter: homeMeta.twitter,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: homeMeta.alternates?.canonical,
    types: {
      'application/llms.txt': `${CANONICAL_SITE_ORIGIN}/llms.txt`,
    },
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icon', type: 'image/png' }],
    apple: [{ url: '/apple-icon', type: 'image/png' }],
  },
  other: {
    'github-repo': GITHUB_REPO_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${efCircular.variable} ${libreBaskerville.variable}`}
      style={
        {
          ['--sans' as string]: `var(--font-hult-sans), Helvetica, 'Open Sans', Arial, sans-serif`,
          ['--serif' as string]: `var(--font-hult-serif), Georgia, 'Times New Roman', serif`,
        } as React.CSSProperties
      }
    >
      <head>
        <link rel="author" href="/humans.txt" />
      </head>
      <body>
        <a href="#page-content" className="skipLink">
          Skip to content
        </a>
        <AppProviders>
          <JsonLdOrganization />
          {children}
          <SiteFooter />
          <ConsentGate />
        </AppProviders>
      </body>
    </html>
  );
}
