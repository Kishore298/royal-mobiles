/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
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
          950: '#052e16',
        },
        dark: {
          bg: '#090d0b',
          surface: '#111914',
          card: '#16221b',
          border: '#1f3327',
          muted: '#94a3b8'
        }
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(34, 197, 94, 0.25)',
        'glow': '0 0 25px -5px rgba(34, 197, 94, 0.35)',
        'glow-lg': '0 0 35px -5px rgba(34, 197, 94, 0.45)',
        'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'dark-subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
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
  ],
}
