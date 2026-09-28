/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wii: {
          blue: '#1ea4ec',
          cyan: '#00d2ff',
          gray: '#eceef2',
          darkGray: '#707780',
          panel: '#f8fafd',
          border: '#cfd7e3',
          card: '#ffffff',
          accentPink: '#ff5c8a',
          accentYellow: '#ffbe3d',
          accentGreen: '#39c078',
        }
      },
      boxShadow: {
        'wii-channel': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04), inset 0 2px 4px rgba(255, 255, 255, 0.9)',
        'wii-pressed': 'inset 0 4px 6px rgba(0, 0, 0, 0.15)',
        'wii-glow': '0 0 20px rgba(30, 164, 236, 0.45)',
      },
      fontFamily: {
        sans: ['"Nunito"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}