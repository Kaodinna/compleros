import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1B4D6B",
          dark: "#143A52",
          light: "#2A6A8F",
        },
        gold: {
          DEFAULT: "#C4985A",
          light: "#D4AD74",
          dark: "#A87D42",
        },
        cream: {
          DEFAULT: "#F0EDE6",
          dark: "#E5E0D6",
        },
        border: "#E2DFD8",
        muted: "#6B7280",
        success: "#2E7D52",
        danger: "#C0392B",
      },
      fontFamily: {
        heading: ["var(--font-eb-garamond)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "Calibri", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        btn: "9px",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(165deg, #F0EDE6 0%, #FFFFFF 50%, #F5F0E8 100%)",
        "navy-gradient":
          "linear-gradient(135deg, #1B4D6B 0%, #143A52 100%)",
        "radial-gold":
          "radial-gradient(circle, rgba(196,152,90,0.08) 0%, transparent 70%)",
        "radial-navy":
          "radial-gradient(circle, rgba(27,77,107,0.05) 0%, transparent 70%)",
      },
      boxShadow: {
        card: "0 8px 30px rgba(27,77,107,0.08)",
        "card-lg": "0 20px 60px rgba(27,77,107,0.2)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
