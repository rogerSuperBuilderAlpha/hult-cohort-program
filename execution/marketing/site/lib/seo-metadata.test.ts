import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { describe, expect, it } from 'vitest';
import { EDUCATOR_PILOT_CTA, PITCHRISE_ALC_LINE, PITCHRISE_TAGLINE } from '@/content/pitchrise';
import { programProjects } from '@/content/program';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { OG_IMAGE_SIZE } from '@/lib/og-image-size';
import { metadataForPath, projectPageMetadata, seoPages } from '@/lib/page-metadata';
import { programStructuredData } from '@/lib/program-jsonld';
import {
  CANONICAL_SITE_ORIGIN,
  METADATA_SITE_NAME,
  PITCHRISE_HOST,
  RUNS_ON_LUDWITT_LINE,
} from '@/lib/site-config';

const siteRoot = path.resolve(__dirname, '..');

function brandedTitle(title: Metadata['title']): string {
  if (title && typeof title === 'object' && 'absolute' in title && typeof title.absolute === 'string') {
    return title.absolute;
  }
  if (typeof title === 'string') return `${title} | ${METADATA_SITE_NAME}`;
  return '';
}

function ogFields(meta: Metadata) {
  return meta.openGraph as {
    title?: string;
    description?: string;
    siteName?: string;
    url?: string;
    type?: string;
    images?: { width?: number; height?: number; alt?: string }[];
  };
}

function twitterFields(meta: Metadata) {
  return meta.twitter as { title?: string; description?: string; card?: string };
}

describe('page metadata', () => {
  it('gives every page its own title, description, and canonical on the production host', () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    const urls = new Set<string>();

    for (const page of seoPages) {
      const meta = metadataForPath(page.path);
      const title = brandedTitle(meta.title);
      const description = meta.description ?? '';
      const canonical = meta.alternates?.canonical;

      expect(title).toContain(METADATA_SITE_NAME);
      expect(description).toContain(RUNS_ON_LUDWITT_LINE);
      expect(canonical).toBe(
        page.path === '/' ? CANONICAL_SITE_ORIGIN : `${CANONICAL_SITE_ORIGIN}${page.path}`
      );
      const og = ogFields(meta);
      const twitter = twitterFields(meta);
      expect(og.title).toBe(title);
      expect(og.description).toBe(description);
      expect(og.siteName).toBe(METADATA_SITE_NAME);
      expect(og.url).toBe(canonical);
      expect(twitter.title).toBe(title);
      expect(twitter.description).toBe(description);
      expect(twitter.card).toBe('summary_large_image');
      expect(og.images?.[0]).toMatchObject({ width: 1200, height: 630, alt: expect.stringContaining(METADATA_SITE_NAME) });

      expect(titles.has(title)).toBe(false);
      expect(descriptions.has(description)).toBe(false);
      expect(urls.has(String(canonical))).toBe(false);
      titles.add(title);
      descriptions.add(description);
      urls.add(String(canonical));
    }
  });

  it('marks the dashboard noindex and leaves public pages indexable', () => {
    expect(metadataForPath('/dashboard').robots).toMatchObject({ index: false, follow: false });
    expect(metadataForPath('/program').robots).toMatchObject({ index: true, follow: true });
  });

  it('gives each project its own article metadata', () => {
    const descriptions = new Set<string>();
    for (const project of programProjects) {
      const meta = projectPageMetadata(project);
      const canonical = `${CANONICAL_SITE_ORIGIN}/program/${project.slug}`;
      expect(ogFields(meta).title).toBe(`${project.title} | ${METADATA_SITE_NAME}`);
      expect(ogFields(meta).url).toBe(canonical);
      expect(meta.alternates?.canonical).toBe(canonical);
      expect(meta.description).toContain(project.summary);
      expect(meta.description).toContain(RUNS_ON_LUDWITT_LINE);
      expect(ogFields(meta).type).toBe('article');
      expect(descriptions.has(meta.description ?? '')).toBe(false);
      descriptions.add(meta.description ?? '');
    }
  });
});

describe('sitemap and robots', () => {
  it('lists public pages on the canonical host and omits the dashboard', () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.some((url) => url.includes('/dashboard'))).toBe(false);
    expect(urls.every((url) => url.startsWith(CANONICAL_SITE_ORIGIN))).toBe(true);

    for (const page of seoPages.filter((entry) => entry.sitemap)) {
      const expected =
        page.path === '/' ? CANONICAL_SITE_ORIGIN : `${CANONICAL_SITE_ORIGIN}${page.path}`;
      expect(urls).toContain(expected);
    }

    for (const project of programProjects) {
      expect(urls).toContain(`${CANONICAL_SITE_ORIGIN}/program/${project.slug}`);
    }
  });

  it('disallows the dashboard and API routes', () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const disallows = rules.flatMap((rule) =>
      Array.isArray(rule.disallow) ? rule.disallow : rule.disallow ? [rule.disallow] : []
    );
    expect(disallows).toContain('/dashboard');
    expect(disallows).toContain('/api/');
    expect(result.sitemap).toBe(`${CANONICAL_SITE_ORIGIN}/sitemap.xml`);
    expect(result.host).toBe(CANONICAL_SITE_ORIGIN);
  });
});

describe('program JSON-LD', () => {
  it('describes an educational program without invented dates or numbers', () => {
    const data = programStructuredData();
    const graph = data['@graph'];
    const program = graph.find((node) => node['@type'] === 'EducationalOccupationalProgram');

    expect(program).toBeDefined();
    expect(program?.name).toBe(METADATA_SITE_NAME);
    expect(program?.description).toContain(RUNS_ON_LUDWITT_LINE);
    expect(program?.url).toBe(CANONICAL_SITE_ORIGIN);
    expect(program?.provider).toMatchObject({
      '@type': 'EducationalOrganization',
      name: 'Hult International Business School',
    });

    const forbidden = /date|price|rating|offer|count|enrollment|duration|credential|salary|occupational/i;
    const walk = (value: unknown, key = ''): void => {
      expect(typeof value).not.toBe('number');
      expect(key).not.toMatch(forbidden);
      if (Array.isArray(value)) {
        for (const entry of value) walk(entry);
        return;
      }
      if (value && typeof value === 'object') {
        for (const [childKey, child] of Object.entries(value)) walk(child, childKey);
        return;
      }
      if (typeof value === 'string') {
        expect(value).not.toMatch(/\d{4}-\d{2}-\d{2}/);
        expect(value).not.toMatch(/\$\d/);
      }
    };
    walk(data);
  });
});

describe('OG image', () => {
  it('is the 1200x630 large-card size', () => {
    expect(OG_IMAGE_SIZE).toEqual({ width: 1200, height: 630 });
    const route = readFileSync(path.join(siteRoot, 'app/opengraph-image.tsx'), 'utf8');
    const twitter = readFileSync(path.join(siteRoot, 'app/twitter-image.tsx'), 'utf8');
    expect(route).toContain('export const size = OG_IMAGE_SIZE');
    expect(route).toContain('size.width');
    expect(route).toContain('size.height');
    expect(route).toContain('OG_IMAGE_ALT');
    expect(route).toContain('RUNS_ON_LUDWITT_LINE');
    const image = readFileSync(path.join(siteRoot, 'lib/og-image.tsx'), 'utf8');
    expect(image).toContain(METADATA_SITE_NAME);
    expect(twitter).toContain("export { alt, size, contentType } from './opengraph-image'");
  });
});

describe('Runs on Ludwitt', () => {
  it('names Ludwitt as the platform and Pitchrise as the ALC process', () => {
    const source = readFileSync(path.join(siteRoot, 'components/RunsOnLudwitt.tsx'), 'utf8');
    expect(source).toContain('Runs on Ludwitt');
    expect(source).not.toContain('Runs on Pitchrise');
    expect(source).toContain('PITCHRISE_ALC_LINE');
    expect(PITCHRISE_ALC_LINE).toBe('Pitchrise, the ALC process in Ludwitt');
    expect(source).toContain('pitchrise.ludwitt.com');
    expect(PITCHRISE_HOST).toBe('pitchrise.ludwitt.com');
    expect(PITCHRISE_TAGLINE).toBe(
      'Run your venture or pitch cohort on Ludwitt — the curriculum from Algorithmacy Cohorts.'
    );
    expect(PITCHRISE_TAGLINE).not.toMatch(/on Pitchrise/);
    expect(EDUCATOR_PILOT_CTA).toBe('Run a free pilot cohort');

    const llms = readFileSync(path.join(siteRoot, 'public/llms.txt'), 'utf8');
    expect(llms).toContain(
      '[Ludwitt](https://pitchrise.ludwitt.com): Platform this cohort runs on.'
    );
    expect(llms).toContain(PITCHRISE_ALC_LINE);
    expect(llms).toContain('https://pitchrise.ludwitt.com/alc');
    expect(llms).not.toContain('[Pitchrise](');

    const footer = readFileSync(path.join(siteRoot, 'components/SiteFooter.tsx'), 'utf8');
    expect(footer).toMatch(/>\s*Ludwitt\s*</);
    expect(footer).not.toMatch(/>\s*Pitchrise\s*</);

    const week4 = programProjects.find((project) => project.slug === 'phase-2-learning-app');
    expect(week4?.description).toContain(PITCHRISE_ALC_LINE);
    expect(week4?.description).toContain('https://pitchrise.ludwitt.com/alc');
    expect(week4?.description).toContain('pitchrise.ludwitt.com');

    const data = programStructuredData();
    const serialized = JSON.stringify(data);
    expect(serialized).toContain(RUNS_ON_LUDWITT_LINE);
    expect(serialized).toContain('https://pitchrise.ludwitt.com');
    expect(serialized).not.toContain('Pitchrise');
  });
});
