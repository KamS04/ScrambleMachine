/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ './src/**/*.{js,ts,jsx,tsx}' ],
  theme: {
    extend: {
      maxWidth: {
        '3/4': '75%',
      }
    },
  },
  plugins: [],
}

