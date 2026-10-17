import { PITCHRISE_URL } from '@/content/pitchrise';
import {
  canonicalUrl,
  DEFAULT_OG_DESCRIPTION,
  GITHUB_REPO_URL,
  METADATA_SITE_NAME,
} from '@/lib/site-config';

/**
 * Organization + program structured data.
 * Dates, prices, durations, and counts are omitted — only fields already
 * stated in public copy are included, and none are numeric schema values.
 */
export function programStructuredData() {
  const url = canonicalUrl('/');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        name: METADATA_SITE_NAME,
        url,
        description: DEFAULT_OG_DESCRIPTION,
        sameAs: [GITHUB_REPO_URL, PITCHRISE_URL],
      },
      {
        '@type': 'EducationalOccupationalProgram',
        name: METADATA_SITE_NAME,
        description: DEFAULT_OG_DESCRIPTION,
        url,
        provider: {
          '@type': 'EducationalOrganization',
          name: 'Hult International Business School',
        },
      },
    ],
  };
}
