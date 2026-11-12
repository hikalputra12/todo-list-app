/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        washi: {
          bg: '#FBF9F5',
          surface: '#F5F1EB',
          card: '#F0ECE4',
          border: '#E7E0D6',
        },
        sumi: {
          ink: '#2D2A26',
          muted: '#78716C',
          faint: '#A8A29E',
        },
        hinoki: {
          wood: '#C49767',
          dark: '#A67746',
          light: '#DEBA93',
        },
        hanko: {
          red: '#B94938',
          hover: '#9E392A',
          faint: '#F7E8E5',
        },
      },
      fontFamily: {
        zen: ['serif', 'Georgia', 'Cambria', 'Times New Roman', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
