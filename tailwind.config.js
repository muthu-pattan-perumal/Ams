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
          9: '#9333ea',
        },
        surface: {
          primary: 'white',
          secondary: '#faf9fb',
          muted: '#f2eff3',
        },
        error: {
          main: '#e5484d',
        },
        success: {
          subtle: '#e6f6eb',
        }
      }
    },
  },
  plugins: [],
}
