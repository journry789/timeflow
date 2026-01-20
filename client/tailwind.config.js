/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'primary-hover': '#1d4ed8',
        'background-light': '#f6f6f8',
        'background-dark': '#0f172a',
        'surface-light': '#ffffff',
        'surface-dark': '#1e293b',
        'text-primary-dark': '#f1f5f9',
        'text-secondary-dark': '#94a3b8',
        'border-dark': '#334155',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Noto Sans SC', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Noto Sans SC', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px'
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark'],
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
  },
}