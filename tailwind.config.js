/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0B0F17",
        surface: "#131927",
        "surface-2": "#1B2333",
        border: "#232C3D",
        "text-primary": "#EAF0FA",
        "text-secondary": "#9AA6BC",
        "text-muted": "#5B6678",
        accent: "#2DD4BF",
        "accent-soft": "rgba(45,212,191,0.12)",
        info: "#3B82F6",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        // 5-level performance scale
        "lvl-1": "#EF4444",
        "lvl-2": "#F97316",
        "lvl-3": "#EAB308",
        "lvl-4": "#84CC16",
        "lvl-5": "#22C55E",
      },
      fontFamily: {
        sans: ["Vazirmatn", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        // flat hairline elevation only — no glow / no gradient-like diffusion
        card: "0 1px 2px rgba(0,0,0,0.3)",
      },
      fontSize: {
        display: ["32px", { lineHeight: "1.2", fontWeight: "700" }],
      },
      keyframes: {
        "bounce-dot": {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
      animation: {
        "bounce-dot": "bounce-dot 1.4s infinite ease-in-out both",
        "pulse-dot": "pulse-dot 2s infinite",
      },
    },
  },
  plugins: [],
};
