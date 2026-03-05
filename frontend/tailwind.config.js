/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores corporativos Conexia
        primary: {
          DEFAULT: '#14145E', // Azul principal
          hover: '#080d3b',
        },
        secondary: {
          DEFAULT: '#C99749', // Crema secundario
        },
        neutral: {
          bg: '#F8FAFC',      // Fondo gris muy claro para legibilidad
          surface: '#FFFFFF', // Tarjetas blancas
          text: '#334155',    // Texto oscuro
          border: '#E2E8F0',
        },
        danger: {
          DEFAULT: '#EF4444', // Rojo para errores
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