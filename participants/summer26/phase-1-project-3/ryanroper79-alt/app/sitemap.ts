import type { MetadataRoute } from 'next';
import { allHandles } from '@/data/participants';
import { positioning } from '@/data/cohort';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = positioning.productionDomain;
  const staticRoutes = [
    '',
    '/work',
    '/join',
    '/partners',
    '/partners/readme',
    '/vote',
    '/contribute',
    '/status',
    '/changelog',
  ];

  const now = new Date();

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: path === '' ? 1 : 0.8,
    })),
    ...allHandles().map((handle) => ({
      url: `${base}/p/${handle}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
