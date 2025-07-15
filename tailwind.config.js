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
        // Professional Color Palette
        'background': '#111827',     // Dark Navy Blue
        'sidebar': '#1F2937',        // Slightly Lighter Navy
        'surface': '#374151',       // Cards, Modals, Inputs
        'border': '#4B5563',        // Borders and dividers
        
        'primary': {
          'DEFAULT': '#3B82F6', // A professional blue for actions
          'hover': '#2563EB',
        },
        'accent': {
          'DEFAULT': '#F59E0B', // A gold/amber accent
          'hover': '#D97706',
        },
        
        'content': {
          'primary': '#F9FAFB',   // Main text (off-white)
          'secondary': '#9CA3AF', // Secondary text (gray)
        },
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}