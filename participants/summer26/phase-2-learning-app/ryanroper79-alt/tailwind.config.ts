import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        leaf: { 50: '#f0fdf4', 500: '#22c55e', 700: '#15803d', 900: '#14532d' },
      },
    },
  },
  plugins: [],
};

export default config;
