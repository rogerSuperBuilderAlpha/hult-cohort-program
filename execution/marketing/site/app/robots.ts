import type { MetadataRoute } from 'next';
import { CANONICAL_SITE_ORIGIN, canonicalUrl } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard'],
    },
    sitemap: canonicalUrl('/sitemap.xml'),
    host: CANONICAL_SITE_ORIGIN,
  };
}
