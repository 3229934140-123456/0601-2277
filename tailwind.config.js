/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pixel: {
          bg: '#1a0f08',
          brown: '#2D1B0E',
          brownLight: '#4A2C17',
          yellow: '#FFD93D',
          yellowDark: '#E6B800',
          green: '#6BCB77',
          greenDark: '#4A9E55',
          red: '#FF6B6B',
          redDark: '#CC5555',
          blue: '#87CEEB',
          blueDark: '#5CA8CC',
          paper: '#F5F5DC',
          paperDark: '#D4C9A3',
          postGreen: '#228B22',
          gold: '#FFD700',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'VT323', 'monospace'],
        retro: ['VT323', 'monospace'],
      },
      animation: {
        'pixel-blink': 'pixel-blink 1s steps(2) infinite',
        'scanline': 'scanline 8s linear infinite',
        'pixel-float': 'pixel-float 2s ease-in-out infinite',
        'star-pop': 'star-pop 0.5s ease-out forwards',
        'shake': 'shake 0.3s ease-in-out',
      },
      keyframes: {
        'pixel-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'pixel-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'star-pop': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
};
