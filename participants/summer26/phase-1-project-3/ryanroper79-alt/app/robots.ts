import type { MetadataRoute } from 'next';
import { positioning } from '@/data/cohort';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${positioning.productionDomain}/sitemap.xml`,
  };
}
