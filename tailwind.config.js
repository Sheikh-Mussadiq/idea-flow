/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f1f5ff",
          100: "#e6ecff",
          200: "#cdd8ff",
          300: "#a9baff",
          400: "#7e90ff",
          500: "#5865FF",
          600: "#4953db",
          700: "#3a42b7",
          800: "#2d3493",
          900: "#232a78",
        },
        secondary: {
          50: "#f0fdfd",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        neutral: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
        },
        success: {
          50: "#f0fdf4",
          500: "#22c55e",
          700: "#15803d",
        },
        warning: {
          50: "#fffbeb",
          500: "#f59e0b",
          700: "#b45309",
        },
        error: {
          50: "#fef2f2",
          500: "#ef4444",
          700: "#b91c1c",
        },
        accent: {
          blue: "#3B82F6",
          teal: "#14B8A6",
          amber: "#F59E0B",
          rose: "#F43F5E",
          purple: "#A855F7",
        },
      },
    },
  },
  plugins: [],
};

export default config;
