import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        rp: {
          purple: "#6d28d9",
          light: "#ede9fe",
          dark: "#4c1d95"
        }
      },
      boxShadow: {
        soft: "0 16px 35px rgba(16,24,39,.07)"
      }
    }
  },
  plugins: []
};

export default config;
