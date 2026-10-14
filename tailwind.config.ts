import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6D28D9",
          dark: "#4C1D95",
          light: "#F3E8FF"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
