/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'rgba(var(--color-brand), 0.05)',
          100: 'rgba(var(--color-brand), 0.1)',
          200: 'rgba(var(--color-brand), 0.2)',
          300: 'rgba(var(--color-brand), 0.3)',
          400: 'rgba(var(--color-brand), 0.4)',
          500: 'rgba(var(--color-brand), 1)',
          600: 'rgba(var(--color-brand-light), 1)',
          700: 'rgba(var(--color-brand), 0.8)',
          800: 'rgba(var(--color-brand), 0.9)',
          900: 'rgba(var(--color-brand), 1)',
        },
        secondary: {
          50: 'rgba(var(--color-secondary), 0.05)',
          100: 'rgba(var(--color-secondary), 0.1)',
          200: 'rgba(var(--color-secondary), 0.2)',
          300: 'rgba(var(--color-secondary), 0.3)',
          400: 'rgba(var(--color-secondary), 0.4)',
          500: 'rgba(var(--color-secondary), 1)',
          600: 'rgba(var(--color-secondary-light), 1)',
          700: 'rgba(var(--color-secondary), 0.8)',
          800: 'rgba(var(--color-secondary), 0.9)',
          900: 'rgba(var(--color-secondary), 1)',
        },
        neutral: {
          50: 'rgba(var(--color-neutral-lighter), 1)',
          100: 'rgba(var(--color-neutral-lighter), 0.8)',
          200: 'rgba(var(--color-neutral-lighter), 0.6)',
          300: 'rgba(var(--color-neutral-lighter), 0.4)',
          400: 'rgba(var(--color-neutral-light), 0.4)',
          500: 'rgba(var(--color-neutral-light), 0.6)',
          600: 'rgba(var(--color-neutral-light), 0.8)',
          700: 'rgba(var(--color-neutral-light), 1)',
          800: 'rgba(var(--color-neutral), 0.8)',
          900: 'rgba(var(--color-neutral), 1)',
        },
        // Wells Fargo Green
        green: {
          50: '#F0F9F4',
          100: '#DCF1E5',
          200: '#B9E3CC',
          300: '#96D5B3',
          400: '#73C799',
          500: '#00702B', // Wells Fargo Green
          600: '#005A22',
          700: '#00431A',
          800: '#002D11',
          900: '#001609',
        },
        // Wells Fargo Gold/Yellow
        yellow: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F6C000', // Wells Fargo Gold
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        red: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#C8102E', // Wells Fargo Red
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#680E0E',
        },
        accent: {
          50: '#F9EFF5',
          100: '#F3DFEB',
          200: '#E7BFD7',
          300: '#DB9FC3',
          400: '#CF7FAF',
          500: '#B95C9B', // Wells Fargo Magenta
          600: '#944A7C',
          700: '#6F375D',
          800: '#4A253E',
          900: '#25121F',
        },
        gray: {
          50: '#F6F6F6', // Wells Fargo Background Gray
          100: '#E6E6E6',
          200: '#CCCCCC',
          300: '#B3B3B3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4D4D4D',
          800: '#333333',
          900: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}