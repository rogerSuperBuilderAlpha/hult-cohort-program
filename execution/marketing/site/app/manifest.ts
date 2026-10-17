import type { MetadataRoute } from 'next';
import { CANONICAL_SITE_ORIGIN, DEFAULT_OG_DESCRIPTION, METADATA_SITE_NAME } from '@/lib/site-config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: METADATA_SITE_NAME,
    short_name: 'Algorithmacy',
    description: DEFAULT_OG_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFAE7',
    theme_color: '#CC164C',
    lang: 'en',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    related_applications: [
      {
        platform: 'web',
        url: CANONICAL_SITE_ORIGIN,
      },
    ],
  };
}
