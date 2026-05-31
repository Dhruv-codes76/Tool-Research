import type { Config } from "tailwindcss";
import formsPlugin from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "background": "#10131a",
        "surface": "#10131a",
        "primary": "#ffffff",
        "on-primary": "#2f3131",
        "secondary": "#b7c8e1",
        "tertiary": "#ffffff",
        "on-surface": "#e1e2eb",
        "on-surface-variant": "#c4c7c8",
        "outline": "#8e9192",
        "outline-variant": "#444748",
        "surface-container-lowest": "#0b0e14",
        "surface-container-low": "#191c22",
        "surface-container": "#1d2026",
        "surface-container-high": "#272a31",
        "surface-container-highest": "#32353c",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Manrope", "sans-serif"],
        mono: ["Space Grotesk", "monospace"],
      },
      spacing: {
        margin: "48px",
        gutter: "24px",
      },
      borderRadius: {
        'full': '0.75rem',
      }
    },
  },
  plugins: [formsPlugin],
};
export default config;
