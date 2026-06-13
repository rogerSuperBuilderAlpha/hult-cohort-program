import type { MetadataRoute } from 'next';
import { programProjects } from '@/content/program';
import { getSiteUrl } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticPages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] }[] = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
    { path: '/overview', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/program', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/apply', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.5, changeFrequency: 'yearly' },
  ];

  return [
    ...staticPages.map(({ path, priority, changeFrequency }) => ({
      url: path ? `${base}${path}` : `${base}/`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...programProjects.map((project) => ({
      url: `${base}/program/${project.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];
}
