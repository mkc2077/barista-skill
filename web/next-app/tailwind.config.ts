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
        sans: ["PingFang SC", "Microsoft YaHei", "Inter", "sans-serif"],
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
      },
      boxShadow: {
        ambient: "var(--shadow-ambient)",
        "sm": "var(--shadow-sm)",
        "md": "var(--shadow-md)",
        "lg": "var(--shadow-lg)",
      },
      borderRadius: {
        card: "10px",
        btn: "9px",
        tag: "6px",
        modal: "14px",
      },
      transitionTimingFunction: {
        "calm": "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
