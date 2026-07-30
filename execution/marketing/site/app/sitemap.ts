import type { MetadataRoute } from 'next';
import { programProjects } from '@/content/program';
import { getSiteUrl } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticPages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] }[] = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
    { path: '/showcase', priority: 0.95, changeFrequency: 'weekly' },
    { path: '/students', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/partners', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/status', priority: 0.85, changeFrequency: 'hourly' },
    { path: '/overview', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/program', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/winning-guide', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/apply', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/dashboard', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/history', priority: 0.7, changeFrequency: 'weekly' },
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
