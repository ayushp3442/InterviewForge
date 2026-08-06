import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        navy: {
          50: "#eef2ff",
          100: "#dbe4ff",
          200: "#bfcfff",
          300: "#93aeff",
          400: "#6485fc",
          500: "#3f5bf7",
          600: "#2a3aec",
          700: "#222bd9",
          800: "#1e25af",
          900: "#1e268a",
          950: "#0c0f3b",
        },
        brand: {
          50: "#f0f4ff",
          100: "#dfe8ff",
          200: "#b9d0ff",
          300: "#7badff",
          400: "#3485fc",
          500: "#0a63f0",
          600: "#004bcc",
          700: "#003ba6",
          800: "#033389",
          900: "#082d71",
          950: "#051b49",
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-slower": "float 10s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "fade-in": "fade-in 0.6s ease-out forwards",
        marquee: "marquee 30s linear infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
      },
      backgroundSize: {
        "300%": "300%",
      },
    },
  },
  plugins: [],
};
export default config;