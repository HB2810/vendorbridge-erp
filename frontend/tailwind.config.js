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
          DEFAULT: '#0A0F1E',
          dark: '#0A0F1E',
          light: '#11182D',
        },
        slate: {
          surface: '#1E2640',
          border: '#334155', // Tailwind slate-700 is #334155
        },
        indigo: {
          brand: '#4F46E5',
        },
        gray: {
          secondary: '#94A3B8',
        },
        amber: {
          warning: '#F59E0B',
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
