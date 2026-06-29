/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0a0a2e',
          card: 'rgba(30, 30, 100, 0.7)',
          cardSolid: '#1a1a5e',
          purpleDeep: '#2d1b69',
          purpleMid: '#4a2c8a',
          purpleLight: '#7c5cbf',
          blueDeep: '#1a237e',
          blueMid: '#283593',
          blueBright: '#3f51b5',
          gold: '#ffc107',
          goldLight: '#ffd54f',
          goldDark: '#f9a825',
          green: '#4caf50',
          greenLight: '#81c784',
          red: '#ef5350',
          redLight: '#ef9a9a',
          coral: '#ff7043',
        }
      },
      fontFamily: {
        display: ['Fredoka', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      animation: {
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        }
      }
    },
  },
  plugins: [],
}
