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
        // 제주 감성 컬러 팔레트
        jeju: {
          sky: "#87CEEB", // 제주 하늘
          ocean: "#4A90E2", // 제주 바다
          sunset: "#FF8A65", // 제주 노을
          tangerine: "#FF7043", // 제주 감귤
          green: "#66BB6A", // 제주 자연
          stone: "#78909C", // 돌하르방
          sand: "#F5F5DC", // 제주 백사장
          coral: "#FF8A80", // 산호빛
          mint: "#4DB6AC", // 민트바다
          lavender: "#9575CD", // 라벤더
        },
        // 그라디언트용 색상
        gradient: {
          start: "#667eea",
          end: "#764ba2",
          jeju: "#FF8A65",
          ocean: "#4A90E2",
        },
      },
      fontFamily: {
        pretendard: ["Pretendard", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      boxShadow: {
        jeju: "0 10px 25px -3px rgba(74, 144, 226, 0.1), 0 4px 6px -2px rgba(74, 144, 226, 0.05)",
        sunset:
          "0 10px 25px -3px rgba(255, 138, 101, 0.1), 0 4px 6px -2px rgba(255, 138, 101, 0.05)",
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.08)",
        glow: "0 0 20px rgba(255, 138, 101, 0.3)",
        "inner-soft": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
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
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundImage: {
        "jeju-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "ocean-gradient": "linear-gradient(135deg, #4A90E2 0%, #87CEEB 100%)",
        "sunset-gradient": "linear-gradient(135deg, #FF8A65 0%, #FF7043 100%)",
        "nature-gradient": "linear-gradient(135deg, #66BB6A 0%, #4DB6AC 100%)",
        glass:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
      },
    },
  },
  plugins: [],
};
