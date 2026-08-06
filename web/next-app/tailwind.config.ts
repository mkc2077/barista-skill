import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        theme: {
          page: "var(--page)",
          surface: "var(--surface)",
          "surface-raised": "var(--surface-raised)",
          "surface-inset": "var(--surface-inset)",
          accent: "var(--accent)",
          "accent-hover": "var(--accent-hover)",
          "accent-bg": "var(--accent-bg)",
          text: "var(--text)",
          "text-secondary": "var(--text-secondary)",
          "text-muted": "var(--text-muted)",
          "text-faint": "var(--text-faint)",
          "text-on-accent": "var(--text-on-accent)",
          border: "var(--border)",
          "border-strong": "var(--border-strong)",
          rule: "var(--rule)",
          danger: "var(--danger)",
          success: "var(--success)",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "SF Pro Text", "PingFang SC", "Microsoft YaHei", "Inter", "sans-serif"],
        editorial: ["Instrument Serif", "Georgia", "serif"],
        keystroke: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "editorial-lg": ["2.75rem", { lineHeight: "1.1", fontWeight: "400" }],
        "editorial-md": ["1.75rem", { lineHeight: "1.15", fontWeight: "400" }],
        eyebrow: ["0.625rem", { lineHeight: "1", letterSpacing: "0.1em" }],
      },
      animation: {
        "msg-in": "msg-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.3s ease both",
        "view-in": "view-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both",
        "steam-rise": "steam-rise 3.2s cubic-bezier(0.32, 0.72, 0, 1) infinite",
        "pulse-glow": "pulse-glow 2.4s cubic-bezier(0.32, 0.72, 0, 1) infinite",
      },
      keyframes: {
        "msg-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "view-in": {
          from: { opacity: "0", transform: "translateY(10px)", filter: "blur(4px)" },
          to: { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },
        "steam-rise": {
          "0%": { transform: "translateY(0) translateX(0) scaleY(1)", opacity: "0" },
          "18%": { opacity: "0.9" },
          "55%": { transform: "translateY(-34px) translateX(3px) scaleY(1.25)", opacity: "0.55" },
          "82%": { transform: "translateY(-64px) translateX(-2px) scaleY(1.5)", opacity: "0.18" },
          "100%": { transform: "translateY(-84px) translateX(1px) scaleY(1.7)", opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 var(--accent-ring)" },
          "50%": { boxShadow: "0 0 0 6px transparent" },
        },
      },
      boxShadow: {
        ambient: "var(--shadow-ambient)",
        "sm": "var(--shadow-sm)",
        "md": "var(--shadow-md)",
        "lg": "var(--shadow-lg)",
        "glass": "var(--glass-shadow)",
      },
      borderRadius: {
        card: "16px",
        btn: "10px",
        tag: "6px",
        modal: "18px",
      },
      transitionTimingFunction: {
        "calm": "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
