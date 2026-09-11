import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-dm-serif)", "Georgia", "Cambria", "serif"],
      },
      colors: {
        cream: "#FAF9F6",
        "cream-dark": "#F5F0E8",
        parchment: "#F0EBE1",
        charcoal: {
          DEFAULT: "#2C2C2C",
          light: "#3A3A3A",
          muted: "#4A4A4A",
        },
        gold: {
          DEFAULT: "#C9A45C",
          light: "#D4B76A",
          muted: "#B8944A",
          faint: "#E8D5A8",
          wash: "rgba(201, 164, 92, 0.08)",
        },
        ink: "#3D3D3D",
        stone: {
          DEFAULT: "#6B6B6B",
          light: "#8A8A8A",
          faint: "#B0B0B0",
        },
        forest: "#2D6A4F",
        "warm-red": "#C0392B",
        amber: {
          DEFAULT: "#D4A017",
          light: "#E6B422",
        },
      },
      backgroundSize: {
        "300%": "300%",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        "card-hover": "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
        "tactile": "0 2px 0 rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)",
        "tactile-press": "0 1px 0 rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        "gold": "0 2px 8px rgba(201, 164, 92, 0.15), 0 4px 16px rgba(201, 164, 92, 0.08)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(100%) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        "score-fill": {
          "0%": { width: "0%" },
        },
        "gentle-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
        "score-fill": "score-fill 0.8s ease-out forwards",
        "gentle-pulse": "gentle-pulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;