import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: "#111318",
        "off-white": "#F7F7F0",
        lime: "#C8F169",
        "lime-hover": "#B8E159",
        "lime-muted": "rgba(200, 241, 105, 0.15)",
        muted: "#888A85",
        surface: "#FFFFFF",
        border: "rgba(17, 19, 24, 0.08)",
        "border-strong": "rgba(17, 19, 24, 0.12)",
        overdue: "#E54D2E",
        "overdue-bg": "rgba(229, 77, 46, 0.08)",
        warning: "#F5A623",
        "warning-bg": "rgba(245, 166, 35, 0.08)",
        success: "#30A46C",
        "success-bg": "rgba(48, 164, 108, 0.08)",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      fontSize: {
        "display-lg": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["2rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-sm": ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "heading": ["1.125rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "body-lg": ["1rem", { lineHeight: "1.5" }],
        "body": ["0.9375rem", { lineHeight: "1.5" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "caption": ["0.8125rem", { lineHeight: "1.4" }],
        "micro": ["0.75rem", { lineHeight: "1.4" }],
      },
      spacing: {
        "4.5": "1.125rem",
        "18": "4.5rem",
      },
      borderRadius: {
        "2.5xl": "1.25rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "card": "0 1px 2px rgba(17, 19, 24, 0.04), 0 2px 4px rgba(17, 19, 24, 0.02)",
        "card-hover": "0 2px 8px rgba(17, 19, 24, 0.06), 0 4px 12px rgba(17, 19, 24, 0.03)",
        "elevated": "0 4px 16px rgba(17, 19, 24, 0.08), 0 8px 32px rgba(17, 19, 24, 0.04)",
        "modal": "0 16px 64px rgba(17, 19, 24, 0.16), 0 32px 96px rgba(17, 19, 24, 0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-right": "slideInRight 0.25s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "check-bounce": "checkBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scan-beam": "scanBeam 2s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "counter": "counter 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        checkBounce: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        scanBeam: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(100%)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        counter: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
