/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        biotech: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052410', // Deep medical dark forest green background
        },
        slate: {
          950: '#031407', // Dark black-green slate
        }
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 102, 0.45)',
        'glow-green-sm': '0 0 10px rgba(0, 255, 102, 0.25)',
        'glow-green-lg': '0 0 40px rgba(0, 255, 102, 0.65)',
        'glass-white': '0 8px 32px 0 rgba(255, 255, 255, 0.08)',
      }
    },
  },
  plugins: [],
}
