/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0d14',
        surface: {
          50: '#1e2433',
          100: '#181d2a',
          200: '#131722',
          300: '#0f121b',
          400: '#0a0d14',
        },
        border: {
          subtle: '#222938',
          default: '#2d3748',
          active: '#3b82f6',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1',
        },
        risk: {
          low: '#10b981',       // Emerald
          moderate: '#f59e0b',  // Amber
          high: '#f97316',      // Orange
          veryHigh: '#f43f5e',  // Rose
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
