/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        jeju: {
          primary: "#0EA5E9",
          sky: "#38BDF8",
          ocean: "#0284C7",
          sunset: "#F97316",
          tangerine: "#FB923C",
          green: "#0EA5A0",
          stone: "#334155",
          sand: "#F8FAFC",
          coral: "#FB7185",
          mint: "#2DD4BF",
          lavender: "#6366F1",
          purple: "#6366F1",
          cta: "#F97316",
        },
        gradient: {
          start: "#0EA5E9",
          end: "#0284C7",
          jeju: "#F97316",
          ocean: "#38BDF8",
        },
      },
      fontFamily: {
        heading: ["Space Grotesk", "Pretendard", "sans-serif"],
        body: ["DM Sans", "Pretendard", "sans-serif"],
        pretendard: ["Pretendard", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      boxShadow: {
        jeju: "0 18px 40px -24px rgba(2, 132, 199, 0.55)",
        sunset: "0 16px 36px -20px rgba(249, 115, 22, 0.4)",
        soft: "0 12px 30px -18px rgba(15, 23, 42, 0.35)",
        glow: "0 0 0 1px rgba(56, 189, 248, 0.15), 0 20px 40px -24px rgba(56, 189, 248, 0.55)",
        "inner-soft": "inset 0 2px 6px 0 rgba(15, 23, 42, 0.12)",
      },
      backdropBlur: {
        xs: "2px",
      },
      scale: {
        102: "1.02",
        105: "1.05",
        110: "1.10",
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        "pulse-soft": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 3s ease-in-out infinite",
        "slide-up": "slideUp 0.6s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        gradient: "gradient 8s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundImage: {
        "jeju-gradient": "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
        "ocean-gradient": "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)",
        "sunset-gradient": "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",
        "nature-gradient": "linear-gradient(135deg, #0EA5A0 0%, #2DD4BF 100%)",
        glass:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.08) 100%)",
      },
    },
  },
  plugins: [],
};
