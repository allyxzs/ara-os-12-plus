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
        aether: {
          bg: "#000000",
          panel: "rgba(6, 7, 12, 0.84)",
          border: "rgba(255, 255, 255, 0.09)",
          magenta: "#ff2a85",
          cyan: "#00f0ff",
          purple: "#9b5de5",
          gold: "#ffb703",
          green: "#00f59b",
          crimson: "#ff4d6d",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        neonMagenta: "0 0 20px rgba(255, 42, 133, 0.35)",
        neonCyan: "0 0 20px rgba(0, 240, 255, 0.30)",
      },
    },
  },
  plugins: [],
};

export default config;
