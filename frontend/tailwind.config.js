/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        surface: '#FFFFFF',
        accent: {
          emerald: '#059669',
          amber: '#D97706',
        }
      }
    },
  },
  plugins: [],
}
