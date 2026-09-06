/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        night: '#0d0d0f',
        surface: '#17171a',
        surface2: '#1f1f23',
        line: '#2a2a2f',
        accent: '#e31c3d',
        'accent-dark': '#ad1530',
        muted: '#96969c',
        ok: '#34d399',
        warn: '#f5a524',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}