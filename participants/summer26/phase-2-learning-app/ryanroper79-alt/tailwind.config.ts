import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ceal: { 50: '#f0fdf6', 500: '#16a34a', 600: '#15803d', 700: '#166534', 900: '#14532d' },
      },
    },
  },
  plugins: [],
};

export default config;
