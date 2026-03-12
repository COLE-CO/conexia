/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A1628', // Navy oscuro - sidebar
          hover: '#0d1f3c',   // Navy hover
        },
        secondary: {
          DEFAULT: '#0966C3', // Azul vibrante - acento/botones
        },
        neutral: {
          bg: '#F0F4F8',      // Fondo general
          surface: '#FFFFFF', // Tarjetas
          text: '#0A1628',    // Texto principal
          border: '#e2e8f0',  // Bordes
          muted: '#647477',   // Texto secundario
        },
        danger: {
          DEFAULT: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['"Mona Sans"', 'sans-serif'],
        hubot: ['"Hubot Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}