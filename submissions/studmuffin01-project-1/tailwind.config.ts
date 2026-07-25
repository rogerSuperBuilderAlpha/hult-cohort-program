import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        surface: {
          bg: "#0F172A",
          card: "#1E293B",
          border: "#334155",
          primary: "#F8FAFC",
          secondary: "#94A3B8",
        },
        /* Custom brand colors for the dashboard */
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        /** Command Center — olive / army green sidebar palette */
        command: {
          50: "#f4f6f0",
          100: "#e4eadc",
          200: "#c8d4b8",
          600: "#5c6b52",
          700: "#465340",
          800: "#354030",
          900: "#283024",
          950: "#1a201a",
          khaki: "#d8cfaa",
          "khaki-dark": "#b8aa78",
        },
      },
    },
  },
  plugins: [],
};

export default config;
