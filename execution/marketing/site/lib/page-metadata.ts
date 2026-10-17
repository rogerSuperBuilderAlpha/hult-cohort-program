import type { Metadata } from 'next';
import { OG_IMAGE_SIZE } from '@/lib/og-image-size';
import {
  canonicalUrl,
  METADATA_SITE_NAME,
  OG_IMAGE_ALT,
  withRunsOnLudwitt,
} from '@/lib/site-config';

export type SitemapFrequency = 'weekly' | 'monthly' | 'yearly';

export type SeoPage = {
  path: string;
  /** Segment title. The root template appends ` | Algorithmacy Cohorts` unless absoluteTitle. */
  title: string;
  description: string;
  /** When false, the page is noindex and omitted from the sitemap. */
  index: boolean;
  sitemap: boolean;
  priority?: number;
  changeFrequency?: SitemapFrequency;
  ogType?: 'website' | 'article';
  absoluteTitle?: boolean;
};

export const seoPages: SeoPage[] = [
  {
    path: '/',
    title: METADATA_SITE_NAME,
    description:
      'Open-access community program: build, deploy, review, and operate production-grade software in six weeks.',
    index: true,
    sitemap: true,
    priority: 1,
    changeFrequency: 'weekly',
    absoluteTitle: true,
  },
  {
    path: '/start',
    title: 'What is this program?',
    description:
      'Visual intro to Algorithmacy Cohorts: six-week timeline, Phase 1 peer review on GitHub, and how the Fall 2026 cohort works.',
    index: true,
    sitemap: true,
    priority: 0.95,
    changeFrequency: 'monthly',
  },
  {
    path: '/overview',
    title: 'Program Overview',
    description:
      'Stakeholder summary of Algorithmacy Cohorts: six-week Fall 2026 structure, production software outcomes, and the published timeline.',
    index: true,
    sitemap: true,
    priority: 0.9,
    changeFrequency: 'monthly',
  },
  {
    path: '/program',
    title: 'Program',
    description:
      'Project requirements, submission standards, and assessment criteria for each week of Algorithmacy Cohorts.',
    index: true,
    sitemap: true,
    priority: 0.9,
    changeFrequency: 'weekly',
  },
  {
    path: '/winning-guide',
    title: 'What Winning Means',
    description:
      'A practical guide for Algorithmacy Cohorts winners on maintaining a repo after it becomes the shared platform.',
    index: true,
    sitemap: true,
    priority: 0.85,
    changeFrequency: 'monthly',
  },
  {
    path: '/hackathon/trustabl',
    title: 'Trustabl Hackathon Track',
    description:
      'Archive of the August 24, 2026 Trustabl contribution guide for Algorithmacy Cohorts: detection rules, threat-model docs, and test fixtures.',
    index: true,
    sitemap: true,
    priority: 0.9,
    changeFrequency: 'weekly',
  },
  {
    path: '/apply',
    title: 'Apply',
    description:
      'Apply to Algorithmacy Cohorts for Fall 2026 — application form, 48-hour technical take-home, and production software assessment.',
    index: true,
    sitemap: true,
    priority: 0.85,
    changeFrequency: 'monthly',
  },
  {
    path: '/history',
    title: 'Submission history',
    description:
      'Merged submission pull requests across Algorithmacy Cohorts terms, discovered from GitHub.',
    index: true,
    sitemap: true,
    priority: 0.7,
    changeFrequency: 'weekly',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy',
    description: 'How Algorithmacy Cohorts collects, uses, and stores participant data.',
    index: true,
    sitemap: true,
    priority: 0.5,
    changeFrequency: 'yearly',
  },
  {
    path: '/terms',
    title: 'Terms of Service',
    description: 'Terms governing use of the Algorithmacy Cohorts platform.',
    index: true,
    sitemap: true,
    priority: 0.5,
    changeFrequency: 'yearly',
  },
  {
    path: '/research/survey',
    title: 'Cohort research survey',
    description:
      'Voluntary Algorithmacy Cohorts research survey on how people learn to coordinate through software.',
    index: true,
    sitemap: false,
  },
  {
    path: '/dashboard',
    title: 'Dashboard',
    description: 'Personal Algorithmacy Cohorts progress, acknowledgments, and account.',
    index: false,
    sitemap: false,
  },
];

export function metadataFor(page: SeoPage, ogType?: 'website' | 'article'): Metadata {
  const description = withRunsOnLudwitt(page.description);
  const canonical = canonicalUrl(page.path);
  const brandedTitle = page.absoluteTitle
    ? page.title
    : `${page.title} | ${METADATA_SITE_NAME}`;
  const image = {
    url: '/opengraph-image',
    width: OG_IMAGE_SIZE.width,
    height: OG_IMAGE_SIZE.height,
    alt: OG_IMAGE_ALT,
  };

  return {
    title: page.absoluteTitle ? { absolute: page.title } : page.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: brandedTitle,
      description,
      url: canonical,
      siteName: METADATA_SITE_NAME,
      type: ogType ?? page.ogType ?? 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: brandedTitle,
      description,
      images: [{ ...image, url: '/twitter-image' }],
    },
    robots: page.index
      ? { index: true, follow: true }
      : { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

export function metadataForPath(path: string): Metadata {
  const page = seoPages.find((entry) => entry.path === path);
  if (!page) throw new Error(`No SEO metadata for ${path}`);
  return metadataFor(page);
}

export function projectPageMetadata(project: {
  title: string;
  summary: string;
  slug: string;
}): Metadata {
  return metadataFor(
    {
      path: `/program/${project.slug}`,
      title: project.title,
      description: project.summary,
      index: true,
      sitemap: true,
      ogType: 'article',
    },
    'article'
  );
}
