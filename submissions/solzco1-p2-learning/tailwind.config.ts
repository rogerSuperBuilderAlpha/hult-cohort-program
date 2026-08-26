import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          ink: "#0f1419",
          slate: "#1a2332",
          gold: "#c9a227",
          copper: "#b87333",
          paper: "#f5f0e8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
