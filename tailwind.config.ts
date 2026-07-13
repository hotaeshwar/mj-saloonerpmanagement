import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#6D5BFF",
          light: "#8a7dff",
          dark: "#513fff",
        },
        secondary: {
          DEFAULT: "#00C2FF",
          light: "#33ceff",
          dark: "#009ecf",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
} satisfies Config;
