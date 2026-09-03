import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: "#0a081e", 100: "#162c43", 200: "#1f2937" },
        teal: { DEFAULT: "#14b8a6", 100: "#34d4c5", 200: "#5de7dc" },
        amber: { DEFAULT: "#f59e0b", 100: "#ffb84d", 200: "#ffd280" },
        razorblue: "#528FF0",
        razorteal: "#14b8a6",
        razordark: "#1f2937",
        razorpurple: "#667eea",
        razorlight: "#f9fafb",
        "primary-hsl": "hsl(210, 100%, 55%)",
        "secondary-hsl": "hsl(165, 80%, 45%)",
        "accent-hsl": "hsl(30, 90%, 60%)",
      },
      fontFamily: {
        headings: ["var(--font-headings)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      animation: {
        "gradient-x": "gradient-x 8s ease infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        blob: "blob 10s infinite",
        "fade-up": "fade-up 0.6s ease forwards",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "glow-blue": "0 0 30px rgba(82,143,240,0.25)",
        "glow-teal": "0 0 30px rgba(20,184,166,0.25)",
        "card": "0 4px 24px rgba(0,0,0,0.06)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".glass": {
          "background-color": "rgba(255,255,255,0.1)",
          "backdrop-filter": "blur(10px)",
          "border-radius": "0.5rem",
        },
      });
    }),
  ],
};

export default config;
