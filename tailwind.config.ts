import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/blog/**/*.md"
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        paper: "var(--color-paper)",
        accent: "var(--color-accent)",
        accentSoft: "var(--color-accent-soft)",
        sun: "var(--color-sun)",
        sunSoft: "var(--color-sun-soft)",
        line: "var(--color-line)",
        muted: "var(--color-muted)"
      },
      boxShadow: {
        card: "0 18px 40px -24px rgba(30, 63, 126, 0.34)"
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};

export default config;
