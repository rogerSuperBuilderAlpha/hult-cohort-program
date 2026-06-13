import type { Metadata } from 'next';
import { JsonLdOrganization } from '@/components/JsonLdOrganization';
import { SiteFooter } from '@/components/SiteFooter';
import { ConsentGate } from '@/components/ConsentGate';
import {
  DEFAULT_OG_DESCRIPTION,
  getSiteUrl,
  GITHUB_REPO_URL,
  SITE_NAME,
} from '@/lib/site-config';
import './globals.css';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} | Dare Mighty Things`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_OG_DESCRIPTION,
  keywords: [
    'Hult',
    'developer cohort',
    'GitHub',
    'Fall 2026',
    'software engineering',
    'open source',
  ],
  authors: [{ name: 'Hult International Business School' }],
  creator: SITE_NAME,
  openGraph: {
    title: SITE_NAME,
    description: DEFAULT_OG_DESCRIPTION,
    url: siteUrl,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: DEFAULT_OG_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: siteUrl,
    types: {
      'application/llms.txt': `${siteUrl}/llms.txt`,
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
    <html lang="en">
      <head>
        <link rel="author" href="/humans.txt" />
      </head>
      <body>
        <JsonLdOrganization />
        {children}
        <SiteFooter />
        <ConsentGate />
      </body>
    </html>
  );
}
