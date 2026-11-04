/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B132B',
          800: '#1C2541',
          700: '#273456',
          600: '#3A506B',
        },
        accent: {
          cyan: '#00E5FF',
          blue: '#48CAE4',
          emerald: '#10B981',
          rose: '#F43F5E',
        }
      }
    },
  },
  plugins: [],
}
