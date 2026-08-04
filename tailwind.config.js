/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ntust: {
          blue: '#0055A5',
          navy: '#002B49',
          gold: '#FFC72C',
          lightBlue: '#E6F0FA',
          cyan: '#00A3E0',
          accent: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
