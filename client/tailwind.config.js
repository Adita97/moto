/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', "sans-serif"],
        sub: ['"Barlow Condensed"', "sans-serif"],
        body: ['"DM Sans"', "sans-serif"],
      },
      colors: {
        bg: "#080808",
        surface: "#111111",
        surface2: "#1a1a1a",
        border: "#252525",
        text: "#f0ece4",
        muted: "#7a7771",
        accent: "#e63012",
        accent2: "#ff6b35",
        gold: "#c9a84c",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      animation: {
        "hero-zoom": "heroZoom 16s ease-in-out infinite alternate",
      },
      keyframes: {
        heroZoom: {
          from: { transform: "scale(1.05)" },
          to: { transform: "scale(1.12)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwind-scrollbar")],
};
