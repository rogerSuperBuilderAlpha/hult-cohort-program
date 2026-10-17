import type { MetadataRoute } from 'next';
import { programProjects } from '@/content/program';
import { seoPages } from '@/lib/page-metadata';
import { canonicalUrl } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...seoPages
      .filter((page) => page.sitemap)
      .map((page) => ({
        url: canonicalUrl(page.path),
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })),
    ...programProjects.map((project) => ({
      url: canonicalUrl(`/program/${project.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];
}
