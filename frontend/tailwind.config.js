/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#F0F4F8', // Very light slate-blue
          dark: '#F0F4F8',
          light: '#E2E8F0',  // Soft gray-blue
        },
        slate: {
          surface: '#FFFFFF', // Clean white
          border: '#CBD5E1',  // Slate-300 light border
        },
        indigo: {
          brand: '#2563EB',   // Royal blue
        },
        gray: {
          secondary: '#475569', // Slate-600
        },
        amber: {
          warning: '#D97706',   // Amber-600
        }
      },
      fontFamily: {
        mono: ['"DM Mono"', 'monospace'],
        sans: ['"Outfit"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
