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
          50: '#e6fff0',
          100: '#b3ffd0',
          200: '#80ffb0',
          300: '#4dff90',
          400: '#1aff70',
          500: '#00e65c',
          600: '#00b347',
          700: '#008033',
          800: '#004d1f',
          900: '#001a0a',
          950: '#020703', // Dark obsidian green
        },
        slate: {
          950: '#040d06', // Custom dark black-green slate
        }
      },
      boxShadow: {
        'glow-green': '0 0 15px rgba(0, 255, 92, 0.45)',
        'glow-green-sm': '0 0 8px rgba(0, 255, 92, 0.25)',
        'glow-green-lg': '0 0 30px rgba(0, 255, 92, 0.6)',
      }
    },
  },
  plugins: [],
}
