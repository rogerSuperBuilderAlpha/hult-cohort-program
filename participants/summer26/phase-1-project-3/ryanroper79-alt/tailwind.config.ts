import type { Config } from 'tailwindcss';

/**
 * CEAL Green brand palette — mangrove green, sun yellow, white.
 * Logo: public/brand/ceal-green-logo.png
 * Verbal identity: data/brand-guidelines.ts (Craft doc v0.2)
 * Visual hex spec: Brand Guidelines §5 pending — values aligned to logo until designer input.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ceal: {
          white: '#FFFFFF',
          mangrove: '#1F5C45', // logo wordmark + leaf base
          leaf: '#3D9B5F', // vibrant leaf gradient tip
          canopy: '#2A7A52', // mid solar-panel green
          sun: '#F4B942', // sun core / rays
          sunGlow: '#FAD978',
          ink: '#163D30', // body text on white
          muted: '#5A7A6E', // secondary copy
          line: '#D4E8DC', // dividers on white
          panel: '#F7FBF8', // soft raised surface
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;
