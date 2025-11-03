/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
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
        },
      },
      maxWidth: {
        '8xl': '100rem',
        '9xl': '120rem',
        '10xl': '140rem',
      },
      aspectRatio: {
        'w-16': '16',
        'h-9': '9',
        'w-1': '1',
        'h-1': '1',
      },
      lineClamp: {
        2: '2',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
}

