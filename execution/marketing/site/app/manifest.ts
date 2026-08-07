import type { MetadataRoute } from 'next';
import { getSiteUrl, SITE_NAME, SITE_TAGLINE } from '@/lib/site-config';

export default function manifest(): MetadataRoute.Manifest {
  const base = getSiteUrl();

  return {
    name: SITE_NAME,
    short_name: 'Hult Cohort',
    description: SITE_TAGLINE,
    start_url: '/',
    display: 'standalone',
    background_color: '#f2f3ee',
    theme_color: '#a81202',
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
        url: base,
      },
    ],
  };
}
