/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['*.html'],
  theme: {
    extend: {
      fontFamily: {
        'oswald': ['Oswald', 'serif'],
        'ubuntu': ['Ubuntu', 'serif'],
        'playfair': ['Playfair Display', 'sans-serif']
      }
    },
  },
  plugins: [],
}

