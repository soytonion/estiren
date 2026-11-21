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
        steren: {
          50: "#f0f8ff",
          100: "#e0f1fe",
          200: "#bae3fd",
          400: "#38bdf8",
          DEFAULT: "#0077c8",
          dark: "#005a9c",
          800: "#004275",
          900: "#002b4d",
          light: "#f0f8ff",
        },
      },
    },
  },
  plugins: [],
};
export default config;
