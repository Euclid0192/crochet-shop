import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50:  "#FFF0F5",
          100: "#FFD6E0",
          200: "#FFACC7",
          300: "#FF85AD",
          400: "#FF5C93",
          500: "#FF3378",
        },
        sky: {
          50:  "#F0F8FF",
          100: "#C8E6FF",
          200: "#A8D8FF",
          300: "#7CC4FF",
          400: "#50B0FF",
          500: "#2496FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 15px rgba(255, 172, 199, 0.2)",
        "soft-blue": "0 2px 15px rgba(168, 216, 255, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
