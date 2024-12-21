import type { Config } from "tailwindcss";
import daisyui from "daisyui";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    { pattern: /bg-./ },
    { pattern: /text-./ },
    { pattern: /border-./ },
    { pattern: /overflow-./ },
    { pattern: /rounded-./ },
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        neutral: {
          50: "#FFFFFF",
          100: "#FAFAFA",
          200: "#F5F5F5",
          300: "#F0F0F0",
          400: "#EAEAEA",
          500: "#E5E5E5",
          600: "#DADADA",
          700: "#D0D0D0",
          800: "#C7C7C7",
          900: "#BFBFBF",
        },
        primary: {
          50: "#ececff",
          100: "#d8d5ff",
          200: "#bdb3ff",
          300: "#a090ff",
          400: "#846dff",
          500: "#6558f5",
          600: "#5749d4",
          700: "#4639b0",
          800: "#36298b",
          900: "#251a67",
        },
        black: {
          100: "#0a0a0a",
          200: "#121212",
        },
      },
      fontFamily: {
        primary: ["Kusanagi", "sans-serif"],
        secondary: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [daisyui],
} satisfies Config;
