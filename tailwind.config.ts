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
          orange:     "#F39C3D",
          "orange-h": "#E8862A",
          "orange-l": "#FCE8CD",
          good:       "#2F9E6B",
          bad:        "#D2503B",
        },
        ink: {
          900: "#1A1611",
          700: "#2A2520",
          500: "#6B6660",
          400: "#9A938B",
          300: "#C8C2BB",
        },
        cream: {
          50:  "#FFF8EC",
          100: "#FFF3E4",
          200: "#F8E9D2",
        },
        paper: "#FBF7F0",
        line:  "#ECE3D5",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans:    ["var(--font-instrument-sans)", "system-ui", "sans-serif"],
        mono:    ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
