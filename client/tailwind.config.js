/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        csgo: {
          dark: '#0f0f0f',
          darker: '#0a0a0a',
          card: '#1a1d23',
          cardHover: '#22262e',
          gold: '#e4b900',
          red: '#cf6a32',
          pink: '#eb4b4b',
          purple: '#8847ff',
          blue: '#4b69ff',
          lightblue: '#5e98d9',
          green: '#4CAF50',
          white: '#b0c3d9',
        },
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
