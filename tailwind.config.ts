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
        primary: {
          DEFAULT: "#587DFE",
          dark: "#4A6CE6",
          light: "#EEF1FF",
        },
        brand: {
          50: "#F5F7FF",
          100: "#EEF1FF",
          200: "#E9EEFF",
          300: "#BDD0FF",
          400: "#8CA6FE",
          500: "#587DFE",
          600: "#4A6CE6",
          700: "#3B4CA7",
          800: "#2C337A",
          900: "#2C337A",
        },
        navy: {
          DEFAULT: "#2C337A",
          light: "#3B4CA7",
        },
        accent: {
          DEFAULT: "#587DFE",
          hover: "#4A6CE6",
          light: "#8CA6FE",
          lighter: "#BDD0FF",
          lightest: "#E9EEFF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F5F7FF",
          muted: "#EEF1FF",
        },
        text: {
          primary: "#2C337A",
          secondary: "#5A6094",
          muted: "#8B91B8",
        },
        border: {
          DEFAULT: "#E2E5F0",
        },
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 280ms ease-out both",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
