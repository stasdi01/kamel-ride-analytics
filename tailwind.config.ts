import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#F97316",
          "orange-dark": "#EA6D07",
          "orange-light": "#FED7AA",
          blue: "#60A5FA",
        },
        surface: "#1A1A1A",
        border: "#2A2A2A",
        "text-primary": "#F5F5F5",
        "text-muted": "#737373",
      },
      backgroundColor: {
        page: "#0F0F0F",
      },
      fontFamily: {
        mono: ["var(--font-dm-mono)", "monospace"],
        sans: ["var(--font-plus-jakarta)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
