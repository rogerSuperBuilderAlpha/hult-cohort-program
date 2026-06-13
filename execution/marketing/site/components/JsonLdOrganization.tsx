import { getSiteUrl, GITHUB_REPO_URL, SITE_NAME } from '@/lib/site-config';

export function JsonLdOrganization() {
  const siteUrl = getSiteUrl();

  const data = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_NAME,
    url: siteUrl,
    description:
      'Cohort-based developer program at Hult International Business School — GitHub-native proof of work.',
    sameAs: [GITHUB_REPO_URL],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
